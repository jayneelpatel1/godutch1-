import { supabase } from './supabase';

import type { AuthUser } from '@/types/auth';

export async function signInWithEmail(email: string): Promise<{ error: string | null }> {
  try {
    const { error, data } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    console.log('SignInWithOtp response:', { error, data });

    if (error) {
      console.error('Supabase OTP error:', JSON.stringify(error));
      return { error: `${error.code || 'unknown'}: ${error.message}` };
    }

    return { error: null };
  } catch (err) {
    console.error('SignInWithEmail exception:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { error: `Failed to send OTP: ${message}` };
  }
}

export async function verifyOTP(
  email: string,
  token: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Verification failed. Please try again.' };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: data.user.user_metadata?.name,
      avatar: data.user.user_metadata?.avatar,
    };

    return { user: authUser, error: null };
  } catch {
    return { user: null, error: 'Failed to verify OTP. Please try again.' };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch {
    return { error: 'Failed to sign out. Please try again.' };
  }
}

export async function getCurrentSession(): Promise<{ sessionId: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { sessionId: null, error: error.message };
    }

    return { sessionId: data.session?.access_token || null, error: null };
  } catch {
    return { sessionId: null, error: 'Failed to get session.' };
  }
}
