import { supabase } from './supabase';

import { mapToDbType } from '@/types/activity';
import type { Activity, ActivityInput, ActivityType } from '@/types/activity';

/**
 * @function getUserName
 * @description Fetches a user's display name from Supabase by user ID.
 *              Falls back to truncated UUID if lookup fails.
 *
 * @param userId — UUID of the user
 * @returns The user's name or first 8 chars of UUID
 */
export async function getUserName(userId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .maybeSingle();
    return data?.name || userId.slice(0, 8);
  } catch {
    return userId.slice(0, 8);
  }
}

/**
 * @function getGroupName
 * @description Fetches a group's name from Supabase by group ID.
 *              Falls back to generic label if lookup fails.
 *
 * @param groupId — UUID of the group
 * @returns The group name or 'a group'
 */
export async function getGroupName(groupId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .maybeSingle();
    return data?.name || 'a group';
  } catch {
    return 'a group';
  }
}

/**
 * @function fetchActivities
 * @description Retrieves all activity records for a given user, ordered newest first.
 *              Performs an accessibility check on the activities table first.
 *
 * @param userId — UUID of the user whose activities to fetch
 * @returns Object containing activities array and error message
 */
export async function fetchActivities(userId: string): Promise<{ activities: Activity[]; error: string | null }> {
  try {
    const { count: tableCheck, error: tableError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (tableError) {
      return { activities: [], error: `Cannot access activities table: ${tableError.message}` };
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { activities: [], error: error.message };
    }

    const activities: Activity[] = (data || []).map((item) => ({
      id: item.id as string,
      userId: item.user_id as string,
      groupId: item.group_id as string | undefined,
      type: item.type as ActivityType,
      description: item.description as string,
      createdAt: item.created_at as string,
    }));

    return { activities, error: null };
  } catch (e: any) {
    return { activities: [], error: 'Failed to fetch activities.' };
  }
}

/**
 * @function createActivity
 * @description Inserts a single activity record for a user.
 *              Uses mapToDbType to convert logical type to DB-compatible type.
 *
 * @param input — ActivityInput with userId, type, description, optional groupId
 * @returns Object containing created activity and error message
 */
export async function createActivity(input: ActivityInput): Promise<{ activity: Activity | null; error: string | null }> {
  try {
    const dbType = mapToDbType(input.type);

    const insertData: Record<string, unknown> = {
      user_id: input.userId,
      type: dbType,
      description: input.description,
    };
    if (input.groupId !== undefined) {
      insertData.group_id = input.groupId;
    }

    const { data, error } = await supabase
      .from('activities')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return { activity: null, error: error.message };
    }

    if (!data) {
      return { activity: null, error: 'No data returned.' };
    }

    return {
      activity: {
        id: data.id as string,
        userId: data.user_id as string,
        groupId: data.group_id as string | undefined,
        type: data.type as ActivityType,
        description: data.description as string,
        createdAt: data.created_at as string,
      },
      error: null,
    };
  } catch (e: any) {
    return { activity: null, error: 'Failed to create activity.' };
  }
}

/**
 * Creates an activity record for every group member EXCEPT the actor.
 * This ensures that when someone adds/updates/deletes an expense,
 * all other group members see it in their Activity tab.
 *
 * @param groupId    — The group where the action happened
 * @param actorId    — The user who performed the action (excluded from notifications)
 * @param input      — Activity details (type, title, description, metadata)
 *
 * @remarks The actor themselves gets an activity logged separately with
 *          the original createActivity call for their own record.
 */
export async function createActivityForGroupMembers(
  groupId: string,
  actorId: string,
  input: Omit<ActivityInput, 'userId' | 'groupId'>
): Promise<{ count: number; error: string | null }> {
  try {
    const dbType = mapToDbType(input.type);

    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .neq('user_id', actorId);

    if (membersError) {
      return { count: 0, error: membersError.message };
    }

    if (!members || members.length === 0) {
      return { count: 0, error: null };
    }

    const activityRows = members.map((m: { user_id: string }) => ({
      user_id: m.user_id,
      group_id: groupId,
      type: dbType,
      description: input.description,
    }));

    const { data: insertData, error: insertError } = await supabase
      .from('activities')
      .insert(activityRows)
      .select();

    if (insertError) {
      return { count: 0, error: insertError.message };
    }

    return { count: activityRows.length, error: null };
  } catch (e: any) {
    return { count: 0, error: 'Failed to create group activities.' };
  }
}

/**
 * @function deleteOldActivities
 * @description Deletes activity records older than a specified number of days.
 *              Useful for cleanup/ housekeeping to prevent table bloat.
 *
 * @param daysOld — Age threshold in days (default 7). Records older than this are deleted.
 * @returns Object containing count of deleted rows and error message
 */
export async function deleteOldActivities(daysOld: number = 7): Promise<{ deleted: number | null; error: string | null }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('activities')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      return { deleted: null, error: error.message };
    }

    const deleted = data?.length ?? 0;
    return { deleted, error: null };
  } catch (e: any) {
    return { deleted: null, error: 'Failed to delete old activities.' };
  }
}
