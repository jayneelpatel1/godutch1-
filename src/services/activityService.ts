import { supabase } from './supabase';

import type { Activity, ActivityInput, ActivityType } from '@/types/activity';

export async function fetchActivities(userId: string): Promise<{ activities: Activity[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[activityService] fetchActivities error:', error);
      return { activities: [], error: error.message };
    }

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
    console.log('[activityService] Creating activity:', input);

    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: input.userId,
        group_id: input.groupId,
        type: input.type,
        title: input.title,
        description: input.description,
        metadata: input.metadata,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[activityService] createActivity error:', error);
      return { activity: null, error: error?.message || 'Failed to create activity.' };
    }

    console.log('[activityService] Activity created:', data.id);

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
