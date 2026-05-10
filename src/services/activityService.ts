import { supabase } from './supabase';

import { mapToDbType } from '@/types/activity';
import type { Activity, ActivityInput, ActivityType } from '@/types/activity';

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

export async function fetchActivities(userId: string): Promise<{ activities: Activity[]; error: string | null }> {
  try {
    console.log('[activityService] fetchActivities called for userId:', userId);

    // First, test if the activities table exists and is accessible
    console.log('[activityService] Checking activities table accessibility...');
    const { count: tableCheck, error: tableError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    if (tableError) {
      console.error('[activityService] TABLE ACCESS ERROR - activities table may not exist or RLS blocks it:', tableError.message, 'Code:', tableError.code);
      return { activities: [], error: `Cannot access activities table: ${tableError.message}` };
    }
    console.log('[activityService] Activities table is accessible. Total rows (approximate):', tableCheck ?? 'unknown');

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[activityService] fetchActivities query error:', JSON.stringify({ message: error.message, code: error.code, details: error.details, hint: error.hint }));
      return { activities: [], error: error.message };
    }

    console.log('[activityService] fetchActivities returned', data ? data.length : 0, 'activities for user', userId);
    if (data && data.length > 0) {
      console.log('[activityService] First activity sample:', JSON.stringify(data[0]));
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
    console.error('[activityService] fetchActivities exception:', e);
    return { activities: [], error: 'Failed to fetch activities.' };
  }
}

export async function createActivity(input: ActivityInput): Promise<{ activity: Activity | null; error: string | null }> {
  try {
    const dbType = mapToDbType(input.type);
    console.log('[activityService] createActivity called:', { type: input.type, dbType, userId: input.userId, groupId: input.groupId, description: input.description });

    const insertData: Record<string, unknown> = {
      user_id: input.userId,
      type: dbType,
      description: input.description,
    };
    if (input.groupId !== undefined) {
      insertData.group_id = input.groupId;
    }

    console.log('[activityService] insertData:', JSON.stringify(insertData));

    const { data, error } = await supabase
      .from('activities')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[activityService] createActivity error:', JSON.stringify({ message: error.message, code: error.code, details: error.details }));
      return { activity: null, error: error.message };
    }

    if (!data) {
      console.error('[activityService] createActivity returned no data');
      return { activity: null, error: 'No data returned.' };
    }

    console.log('[activityService] Activity created! ID:', data.id);
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
    console.error('[activityService] createActivity exception:', e);
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
    console.log('[activityService] createActivityForGroupMembers:', { groupId, actorId, type: input.type, dbType });

    // Fetch all member IDs for this group except the actor
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .neq('user_id', actorId);

    if (membersError) {
      console.error('[activityService] Failed to fetch group members:', JSON.stringify({ message: membersError.message, code: membersError.code }));
      return { count: 0, error: membersError.message };
    }

    if (!members || members.length === 0) {
      console.log('[activityService] No other members to notify for group', groupId);
      return { count: 0, error: null };
    }

    // Batch insert one activity row per member
    const activityRows = members.map((m: { user_id: string }) => ({
      user_id: m.user_id,
      group_id: groupId,
      type: dbType,
      description: input.description,
    }));

    console.log('[activityService] Batch inserting', activityRows.length, 'activity rows');

    const { data: insertData, error: insertError } = await supabase
      .from('activities')
      .insert(activityRows)
      .select();

    if (insertError) {
      console.error('[activityService] Failed to insert group activities:', JSON.stringify({ message: insertError.message, code: insertError.code, details: insertError.details }));
      return { count: 0, error: insertError.message };
    }

    console.log(`[activityService] Created ${activityRows.length} activities for group members`);
    return { count: activityRows.length, error: null };
  } catch (e: any) {
    console.error('[activityService] createActivityForGroupMembers exception:', e);
    return { count: 0, error: 'Failed to create group activities.' };
  }
}

export async function deleteOldActivities(daysOld: number = 7): Promise<{ deleted: number | null; error: string | null }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    console.log('[activityService] deleteOldActivities: deleting activities older than', cutoffDate.toISOString());

    const { data, error } = await supabase
      .from('activities')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('[activityService] deleteOldActivities error:', JSON.stringify({ message: error.message, code: error.code }));
      return { deleted: null, error: error.message };
    }

    const deleted = data?.length ?? 0;
    if (deleted > 0) {
      console.log(`[activityService] Deleted ${deleted} activities older than ${daysOld} days`);
    } else {
      console.log('[activityService] deleteOldActivities: no activities to delete (or DELETE not supported by RLS)');
    }

    return { deleted, error: null };
  } catch (e: any) {
    console.error('[activityService] deleteOldActivities exception:', e);
    return { deleted: null, error: 'Failed to delete old activities.' };
  }
}
