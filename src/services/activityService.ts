import { supabase } from './supabase';

import type { Activity, ActivityInput, ActivityType } from '@/types/activity';

export async function fetchActivities(userId: string): Promise<{ activities: Activity[]; error: string | null }> {
  try {
    console.log('[activityService] DEBUG: fetchActivities called for userId:', userId);

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[activityService] DEBUG: fetchActivities error:', JSON.stringify(error));
      return { activities: [], error: error.message };
    }

    console.log('[activityService] DEBUG: fetchActivities returned', data ? data.length : 0, 'activities');

    const activities: Activity[] = (data || []).map((item) => ({
      id: item.id as string,
      userId: item.user_id as string,
      groupId: item.group_id as string | undefined,
      type: item.type as ActivityType,
      title: item.title as string,
      description: item.description as string | undefined,
      metadata: item.metadata as Record<string, unknown> | undefined,
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
    console.log('[activityService] Creating activity:', JSON.stringify(input));

    // Strip undefined values — Supabase rejects them
    const insertData: Record<string, unknown> = {
      user_id: input.userId,
      group_id: input.groupId,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
    };
    if (input.metadata) {
      insertData.metadata = input.metadata;
    }

    console.log('[activityService] DEBUG: insertData:', JSON.stringify(insertData));

    const { data, error } = await supabase
      .from('activities')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[activityService] createActivity Supabase error:', JSON.stringify(error));
      console.error('[activityService] createActivity error details:', error);
      return { activity: null, error: error.message || 'Failed to create activity.' };
    }

    if (!data) {
      console.error('[activityService] createActivity returned no data');
      return { activity: null, error: 'No data returned.' };
    }

    console.log('[activityService] Activity created successfully:', data.id);

    const activity: Activity = {
      id: data.id as string,
      userId: data.user_id as string,
      groupId: data.group_id as string | undefined,
      type: data.type as ActivityType,
      title: data.title as string,
      description: data.description as string | undefined,
      metadata: data.metadata as Record<string, unknown> | undefined,
      createdAt: data.created_at as string,
    };

    return { activity, error: null };
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
    console.log('[activityService] DEBUG: createActivityForGroupMembers called:', { groupId, actorId, type: input.type, title: input.title });

    // Fetch all member IDs for this group except the actor
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId)
      .neq('user_id', actorId);

    if (membersError) {
      console.error('[activityService] DEBUG: Failed to fetch group members:', JSON.stringify(membersError));
      return { count: 0, error: membersError.message };
    }

    console.log('[activityService] DEBUG: Found members:', members ? members.length : 0, JSON.stringify(members));

    if (!members || members.length === 0) {
      console.log('[activityService] No other members to notify for group', groupId);
      return { count: 0, error: null };
    }

    // Build metadata — ensure no undefined values (Supabase rejects them)
    const cleanMetadata = input.metadata
      ? Object.fromEntries(
          Object.entries(input.metadata).filter(([_, v]) => v !== undefined)
        )
      : {};

    // Batch insert one activity row per member
    const activityRows = members.map((m: { user_id: string }) => ({
      user_id: m.user_id,
      group_id: groupId,
      type: input.type,
      title: input.title || 'Activity',
      description: input.description || null,
      metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : null,
    }));

    console.log('[activityService] DEBUG: Inserting activity rows:', JSON.stringify(activityRows));

    const { data: insertData, error: insertError } = await supabase
      .from('activities')
      .insert(activityRows)
      .select();

    if (insertError) {
      console.error('[activityService] DEBUG: Failed to insert group activities:', JSON.stringify(insertError));
      return { count: 0, error: insertError.message };
    }

    console.log(`[activityService] DEBUG: Successfully created ${activityRows.length} activities for group ${groupId}`, insertData ? `returned ${insertData.length} rows` : 'no data returned');
    return { count: activityRows.length, error: null };
  } catch (e: any) {
    console.error('[activityService] DEBUG: createActivityForGroupMembers exception:', e);
    return { count: 0, error: 'Failed to create group activities.' };
  }
}

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
      console.error('[activityService] deleteOldActivities error:', error);
      return { deleted: null, error: error.message };
    }

    const deleted = data?.length ?? 0;
    if (deleted > 0) {
      console.log(`[activityService] Deleted ${deleted} activities older than ${daysOld} days`);
    }

    return { deleted, error: null };
  } catch (e: any) {
    console.error('[activityService] deleteOldActivities exception:', e);
    return { deleted: null, error: 'Failed to delete old activities.' };
  }
}
