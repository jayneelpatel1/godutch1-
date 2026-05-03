import { supabase } from './supabase';

import type { User } from '@/types/group';
import type { AuthUser } from '@/types/auth';

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

export async function createOrUpdateUser(authUser: AuthUser): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log('[userService] Creating/updating user:', authUser);
    
    // Upsert user by ID (Firebase UID is the primary key)
    // Note: Email unique constraint has been removed to support Firebase Auth
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name || authUser.email.split('@')[0] || 'User',
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
