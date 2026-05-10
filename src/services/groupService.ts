import { supabase } from './supabase';
import { createActivity, createActivityForGroupMembers, getUserName } from './activityService';

import type { Group, GroupMember, GroupWithMembers, GroupInput } from '@/types/group';

/**
 * @function fetchGroups
 * @description Retrieves all groups for a user via a two-step query:
 *              1. Fetch all group_ids where user is a member
 *              2. Fetch the full group records including member list
 *
 * @param userId — UUID of the current user
 * @returns Object containing array of groups (with members) and error message
 */
export async function fetchGroups(userId: string): Promise<{ groups: GroupWithMembers[]; error: string | null }> {
  try {
    const { data: memberData, error: memberError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    if (memberError) {
      return { groups: [], error: memberError.message };
    }

    if (!memberData || memberData.length === 0) {
      return { groups: [], error: null };
    }

    const groupIds = memberData.map((m: Record<string, unknown>) => m.group_id as string);

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select('*, group_members(user_id, joined_at)')
      .in('id', groupIds);

    if (groupError) {
      return { groups: [], error: groupError.message };
    }

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
    return { groups: [], error: 'Failed to fetch groups.' };
  }
}

/**
 * @function createGroup
 * @description Creates a new group in Supabase, adds all members (including creator),
 *              and notifies non-creator members via the activity feed.
 *
 * @param groupInput — Group name and array of member user IDs
 * @param createdBy — UUID of the user creating the group
 * @returns Object containing the created group (with members) and error message
 */
export async function createGroup(groupInput: GroupInput, createdBy: string): Promise<{ group: GroupWithMembers | null; error: string | null }> {
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({ name: groupInput.name, created_by: createdBy, type: 'other' })
      .select()
      .single();

    if (groupError) {
      return { group: null, error: groupError?.message || 'Failed to create group.' };
    }

    if (!groupData) {
      return { group: null, error: 'Failed to create group - no data returned.' };
    }

    const allMemberIds = [createdBy, ...groupInput.memberIds.filter((id) => id !== createdBy)];

    const members = allMemberIds.map((userId) => ({
      group_id: groupData.id,
      user_id: userId,
      joined_at: new Date().toISOString(),
    }));

    const { error: memberError } = await supabase
      .from('group_members')
      .insert(members);

    if (memberError) {
      return { group: null, error: memberError.message };
    }

    const creatorName = await getUserName(createdBy);
    const groupDesc = `Group "${groupData.name}" created by ${creatorName}`;
    await createActivityForGroupMembers(groupData.id, createdBy, {
      type: 'group_created',
      description: groupDesc,
    });

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
    return { group: null, error: e.message || 'Failed to create group.' };
  }
}

/**
 * @function updateGroup
 * @description Updates group metadata (name) in Supabase.
 *
 * @param groupId — UUID of the group to update
 * @param updates — Partial Group object with fields to update
 * @returns Object with error message (null on success)
 */
export async function updateGroup(groupId: string, updates: Partial<Group>): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId);

    return { error: error?.message || null };
  } catch (e) {
    return { error: 'Failed to update group.' };
  }
}

/**
 * @function deleteGroup
 * @description Deletes a group from Supabase and notifies remaining members.
 *
 * @param groupId — UUID of the group to delete
 * @param groupName — Display name for the notification message
 * @param deletedBy — UUID of the user performing the deletion
 * @returns Object with error message (null on success)
 */
export async function deleteGroup(groupId: string, groupName?: string, deletedBy?: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (!error && deletedBy) {
      const deletedByName = await getUserName(deletedBy);
      const groupLabel = groupName ? `"${groupName}"` : 'a group';
      const delGroupDesc = `${groupLabel} deleted by ${deletedByName}`;
      await createActivityForGroupMembers(groupId, deletedBy, {
        type: 'group_deleted',
        description: delGroupDesc,
      });
    }

    return { error: error?.message || null };
  } catch (e) {
    return { error: 'Failed to delete group.' };
  }
}

/**
 * @function addGroupMember
 * @description Adds a user to a group's member list and creates a
 *              'member_added' activity for that user.
 *
 * @param groupId — UUID of the group
 * @param userId — UUID of the user to add
 * @param groupName — Display name for the notification message
 * @returns Object with error message (null on success)
 */
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
      const label = groupName ? `"${groupName}"` : 'a group';
      const memberDesc = `You joined ${label}`;
      const memberActivity = await createActivity({
        userId,
        groupId,
        type: 'member_added',
        description: memberDesc,
      });
      if (memberActivity.error) {
        console.error('[groupService] Failed to create member_added activity:', memberActivity.error);
      }
    }

    return { error: error?.message || null };
  } catch (e) {
    return { error: 'Failed to add member.' };
  }
}
