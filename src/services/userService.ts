import { supabase } from './supabase';

import type { User } from '@/types/group';
import type { AuthUser } from '@/types/auth';

export async function searchUsersByEmail(
  query: string,
  excludeIds: string[] = []
): Promise<{ users: (User & { id: string })[]; error: string | null }> {
  try {
    if (!query || query.length < 2) {
      return { users: [], error: null };
    }

    let supabaseQuery = supabase
      .from('users')
      .select('id, name, email, avatar')
      .ilike('email', `${query}%`)
      .limit(5);

    if (excludeIds.length > 0) {
      supabaseQuery = supabaseQuery.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      return { users: [], error: error.message };
    }

    return { users: (data || []) as (User & { id: string })[], error: null };
  } catch (e: any) {
    console.error('[userService] searchUsersByEmail failed:', e);
    return { users: [], error: e.message || 'Failed to search users.' };
  }
}

export async function checkUserByEmail(email: string): Promise<{ exists: boolean; user: User | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar, phone')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return { exists: false, user: null, error: error.message };
    }

    if (!data) {
      return { exists: false, user: null, error: null };
    }

    return { exists: true, user: data as User, error: null };
  } catch (e) {
    console.error('[userService] checkUserByEmail failed:', e);
    return { exists: false, user: null, error: 'Failed to check user.' };
  }
}

export async function fetchUsersByIds(userIds: string[]): Promise<{ users: (User & { id: string })[]; error: string | null }> {
  try {
    if (!userIds || userIds.length === 0) {
      return { users: [], error: null };
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar')
      .in('id', userIds);

    if (error) {
      return { users: [], error: error.message };
    }

    return { users: (data || []) as (User & { id: string })[], error: null };
  } catch (e: any) {
    console.error('[userService] fetchUsersByIds failed:', e);
    return { users: [], error: e.message || 'Failed to fetch users.' };
  }
}

export async function getUserById(userId: string): Promise<{ user: (User & { id: string }) | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: data as (User & { id: string }) | null, error: null };
  } catch (e: any) {
    console.error('[userService] getUserById failed:', e);
    return { user: null, error: e.message || 'Failed to fetch user.' };
  }
}

export async function updateUser(userId: string, updates: { name?: string; avatar?: string }): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('[userService] Updating user:', userId, updates);

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[userService] updateUser Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('[userService] User updated successfully:', data);
    return { success: true, error: null };
  } catch (e: any) {
    console.error('[userService] updateUser failed:', e);
    return { success: false, error: e.message || 'Failed to update user.' };
  }
}

export async function createOrUpdateUser(authUser: AuthUser): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('[userService] Creating/updating user:', authUser);
    
    // First, check if user already exists in Supabase to preserve name
    const { data: existingUser } = await supabase
      .from('users')
      .select('name')
      .eq('id', authUser.id)
      .maybeSingle();
    
    let finalName: string;

    if (existingUser?.name) {
      // User exists — preserve their existing name (never overwrite with Google name)
      finalName = existingUser.name;
    } else {
      // New user — use Google name, fallback to email prefix, then 'User'
      finalName = authUser.name || authUser.email?.split('@')[0] || 'User';
    }
    
    // Upsert user by ID (Firebase UID is the primary key)
    // Note: Email unique constraint has been removed to support Firebase Auth
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email: authUser.email,
          name: finalName,
          phone: null,
          avatar: authUser.avatar || null,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('[userService] createOrUpdateUser Supabase error:', error);
      return { success: false, error: error.message };
    }

    console.log('[userService] User created/updated successfully:', data);
    return { success: true, error: null };
  } catch (e: any) {
    console.error('[userService] createOrUpdateUser failed:', e);
    return { success: false, error: e.message || 'Failed to save user.' };
  }
}
