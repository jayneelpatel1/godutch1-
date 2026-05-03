import { signOut } from 'firebase/auth';

import { firebaseAuth } from './firebaseConfig';

import type { AuthUser } from '@/types/auth';

export function onGoogleAuthStateChange(callback: (user: AuthUser | null) => void) {
  return firebaseAuth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      callback({
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || '',
        avatar: firebaseUser.photoURL || undefined,
      });
    } else {
      callback(null);
    }
  });
}

export async function signOutWithGoogle(): Promise<{ error: string | null }> {
  try {
    await signOut(firebaseAuth);
    return { error: null };
  } catch (error) {
    console.error('[googleAuth] signOut error:', error);
    return { error: 'Failed to sign out' };
  }
}
