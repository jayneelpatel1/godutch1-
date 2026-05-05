import { supabase } from './supabase';
import { createActivity } from './activityService';

import type { Group, GroupMember, GroupWithMembers, GroupInput } from '@/types/group';
import type { ActivityInput } from '@/types/activity';

export async function fetchGroups(userId: string): Promise<{ groups: GroupWithMembers[]; error: string | null }> {
  try {
    console.log('[groupService] fetchGroups called for userId:', userId);

    // Step 1: Get all group IDs where user is a member
    const { data: memberData, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (memberError) {
      console.error('[groupService] Error fetching group members:', memberError);
      return { groups: [], error: memberError.message };
    }

    console.log('[groupService] Found group IDs for user:', memberData?.map((m: any) => m.group_id));

    if (!memberData || memberData.length === 0) {
      console.log('[groupService] No groups found for user');
      return { groups: [], error: null };
    }

    const groupIds = memberData.map((m: Record<string, unknown>) => m.group_id as string);

    // Step 2: Fetch groups with those IDs, including all members
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select(`
        *,
        group_members(
          user_id,
          joined_at
        )
      `)
      .in('id', groupIds);

    if (groupError) {
      console.error('[groupService] Error fetching groups:', groupError);
      return { groups: [], error: groupError.message };
    }

    console.log('[groupService] Fetched groups:', groupData?.map((g: any) => ({ id: g.id, name: g.name })));

    const groupsWithMembers: GroupWithMembers[] = (groupData || []).map((group: Record<string, unknown>) => ({
      id: group.id as string,
      name: group.name as string,
      created_by: group.created_by as string,
      created_at: group.created_at as string,
      members: (group.group_members as GroupMember[]) || [],
      memberCount: ((group.group_members as GroupMember[]) || []).length,
    }));

    return { groups: groupsWithMembers, error: null };
  } catch (e) {
    console.error('[groupService] fetchGroups failed:', e);
    return { groups: [], error: 'Failed to fetch groups.' };
  }
}

export async function createGroup(groupInput: GroupInput, createdBy: string): Promise<{ group: GroupWithMembers | null; error: string | null }> {
  try {
    console.log('[groupService] createGroup called:', { name: groupInput.name, createdBy, memberIds: groupInput.memberIds });

    // Create the group first
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({ name: groupInput.name, created_by: createdBy, type: 'other' })
      .select()
      .single();

    if (groupError) {
      console.error('[groupService] Supabase insert error:', groupError);
      return { group: null, error: groupError?.message || 'Failed to create group.' };
    }

    if (!groupData) {
      return { group: null, error: 'Failed to create group - no data returned.' };
    }

    console.log('[groupService] Group created:', groupData.id);

    // Add all members (including creator)
    const allMemberIds = [createdBy, ...groupInput.memberIds.filter((id) => id !== createdBy)];
    
    const members = allMemberIds.map((userId) => ({
      group_id: groupData.id,
      user_id: userId,
      joined_at: new Date().toISOString(),
    }));

    console.log('[groupService] Inserting members:', members);

    const { error: memberError } = await supabase
      .from('group_members')
      .insert(members);

    if (memberError) {
      console.error('[groupService] Error inserting members:', memberError);
      return { group: null, error: memberError.message };
    }

    console.log('[groupService] Members inserted successfully');

    // Log group_created activity
    try {
      const activityInput: ActivityInput = {
        userId: createdBy,
        groupId: groupData.id,
        type: 'group_created',
        title: `Group "${groupData.name}" created`,
        description: `Group created with ${members.length} member${members.length !== 1 ? 's' : ''}`,
        metadata: { groupName: groupData.name, memberCount: members.length },
      };
      await createActivity(activityInput);
    } catch (e) {
      console.error('[groupService] Failed to log group_created activity:', e);
    }

    const groupWithMembers: GroupWithMembers = {
      id: groupData.id,
      name: groupData.name,
      created_by: groupData.created_by,
      created_at: groupData.created_at,
      members,
      memberCount: members.length,
    };

    return { group: groupWithMembers, error: null };
  } catch (e: any) {
    console.error('[groupService] createGroup failed:', e);
    return { group: null, error: e.message || 'Failed to create group.' };
  }
}

export async function updateGroup(groupId: string, updates: Partial<Group>): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId);

    return { error: error?.message || null };
  } catch (e) {
    console.error('[groupService] updateGroup failed:', e);
    return { error: 'Failed to update group.' };
  }
}

export async function deleteGroup(groupId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    return { error: error?.message || null };
  } catch (e) {
    console.error('[groupService] deleteGroup failed:', e);
    return { error: 'Failed to delete group.' };
  }
}

export async function addGroupMember(groupId: string, userId: string, groupName?: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        joined_at: new Date().toISOString(),
      });

    if (!error) {
      // Log member_added activity
      try {
        const activityInput: ActivityInput = {
          userId,
          groupId,
          type: 'member_added',
          title: 'New member joined',
          description: groupName ? `Joined group "${groupName}"` : 'Joined a group',
          metadata: { groupName },
        };
        await createActivity(activityInput);
      } catch (e) {
        console.error('[groupService] Failed to log member_added activity:', e);
      }
    }

    return { error: error?.message || null };
  } catch (e) {
    console.error('[groupService] addGroupMember failed:', e);
    return { error: 'Failed to add member.' };
  }
}
