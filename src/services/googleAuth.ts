import { signOut } from 'firebase/auth';

import { firebaseAuth } from './firebaseConfig';

import type { AuthUser } from '@/types/auth';

/**
 * @function onGoogleAuthStateChange
 * @description Listens to Firebase auth state changes and maps the Firebase user
 *              to the app's AuthUser type. Returns an unsubscribe function.
 *
 * @param callback — Called with AuthUser when logged in, null when logged out
 * @returns Unsubscribe function to stop listening
 */
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

/**
 * @function signOutWithGoogle
 * @description Signs the current user out of Firebase Auth.
 *
 * @returns Object with error message (null on success)
 */
export async function signOutWithGoogle(): Promise<{ error: string | null }> {
  try {
    await signOut(firebaseAuth);
    return { error: null };
  } catch (error) {
    console.error('[googleAuth] signOut error:', error);
    return { error: 'Failed to sign out' };
  }
}
