import { supabase } from './supabase';

import type { Group, GroupMember, GroupInput } from '@/types/group';

export async function fetchGroups(userId: string): Promise<{ groups: Group[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members!inner(user_id)
      `)
      .eq('group_members.user_id', userId);

    if (error) {
      return { groups: [], error: error.message };
    }

    return { groups: data || [], error: null };
  } catch {
    return { groups: [], error: 'Failed to fetch groups.' };
  }
}

export async function createGroup(groupInput: GroupInput, createdBy: string): Promise<{ group: Group | null; error: string | null }> {
  try {
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({ name: groupInput.name, created_by: createdBy })
      .select()
      .single();

    if (groupError || !groupData) {
      return { group: null, error: groupError?.message || 'Failed to create group.' };
    }

    const members: GroupMember[] = groupInput.memberIds.map((userId) => ({
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

    return { group: groupData, error: null };
  } catch {
    return { group: null, error: 'Failed to create group.' };
  }
}

export async function updateGroup(groupId: string, updates: Partial<Group>): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId);

    return { error: error?.message || null };
  } catch {
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
  } catch {
    return { error: 'Failed to delete group.' };
  }
}
