import { supabase } from './supabase';

import type { User } from '@/types/group';
import type { AuthUser } from '@/types/auth';

/**
 * @function searchUsersByEmail
 * @description Searches for users whose email starts with the given query string.
 *              Used for the "add member" autocomplete feature. Excludes specified IDs.
 *
 * @param query — Partial email string to search (minimum 2 chars)
 * @param excludeIds — Array of user IDs to exclude from results
 * @returns Object containing matching users (max 5) and error message
 */
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
    return { users: [], error: e.message || 'Failed to search users.' };
  }
}

/**
 * @function checkUserByEmail
 * @description Checks if a user with the given email exists in Supabase.
 *              Used to determine whether to show "Invite" or "Add" for a member.
 *
 * @param email — The email to look up
 * @returns Object with exists flag, user data (if found), and error message
 */
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
    return { exists: false, user: null, error: 'Failed to check user.' };
  }
}

/**
 * @function fetchUsersByIds
 * @description Bulk-fetches user profiles by an array of user UUIDs.
 *
 * @param userIds — Array of user UUIDs to fetch
 * @returns Object containing matching users and error message
 */
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
    return { users: [], error: e.message || 'Failed to fetch users.' };
  }
}

/**
 * @function getUserById
 * @description Fetches a single user's profile by UUID.
 *
 * @param userId — UUID of the user to fetch
 * @returns Object containing user (or null) and error message
 */
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
    return { user: null, error: e.message || 'Failed to fetch user.' };
  }
}

/**
 * @function updateUser
 * @description Updates a user's name and/or avatar in Supabase.
 *
 * @param userId — UUID of the user to update
 * @param updates — Object with optional name and/or avatar fields
 * @returns Object indicating success/failure and error message
 */
export async function updateUser(userId: string, updates: { name?: string; avatar?: string }): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to update user.' };
  }
}

/**
 * @function createOrUpdateUser
 * @description Upserts a user record in Supabase using Firebase UID as the primary key.
 *              Preserves the existing user's name if they already exist (never overwrites
 *              with Google name). For new users, uses Google display name, email prefix,
 *              or 'User' as fallback.
 *
 * @param authUser — AuthUser object from Firebase (id, email, name, avatar)
 * @returns Object indicating success/failure and error message
 *
 * @remarks Email unique constraint has been removed from the DB to support Firebase Auth
 */
export async function createOrUpdateUser(authUser: AuthUser): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('name')
      .eq('id', authUser.id)
      .maybeSingle();

    let finalName: string;

    if (existingUser?.name) {
      finalName = existingUser.name;
    } else {
      finalName = authUser.name || authUser.email?.split('@')[0] || 'User';
    }

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
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (e: any) {
    return { success: false, error: e.message || 'Failed to save user.' };
  }
}
