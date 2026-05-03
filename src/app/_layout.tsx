/**
 * Root Layout Component
 * ------------------
 * Handles:
 * - Listening to Firebase auth state changes
 * - Redirecting to auth or main routes based on user state
 * - Managing splash screen visibility
 */

import { useEffect } from 'react';
import { Slot, useRouter } from 'expo-router';
import { SplashScreen } from 'expo-router';

import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/hooks/QueryProvider';
import { onGoogleAuthStateChange } from '@/services/googleAuth';
import { createOrUpdateUser } from '@/services/userService';

// Prevent auto-hiding splash screen until auth state is resolved
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // ---------- Auth State ----------
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const router = useRouter();

  // ---------- Effects ----------
  
  /**
   * Subscribe to Firebase auth state changes
   * Updates Zustand store and hides splash screen when done
   */
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onGoogleAuthStateChange(async (authUser) => {
      if (!mounted) return;

      if (authUser) {
        setUser(authUser);
        // Sync user to Supabase database (idempotent upsert)
        try {
          await createOrUpdateUser(authUser);
        } catch (e) {
          console.error('[RootLayout] Failed to sync user to database:', e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      SplashScreen.hideAsync();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [setUser, setLoading]);

  /**
   * Handle navigation based on auth state
   * Redirects to /(main) if logged in, /(auth)/login if not
   */
  useEffect(() => {
    if (isLoading) return;

    // Avoid unnecessary redirects if already on the correct route
    if (user) {
      router.replace('/(main)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isLoading, user, router]);

  // ---------- Render ----------

  // Show nothing while loading (splash screen is visible)
  if (isLoading) {
    return null;
  }

  // Wrap app with QueryProvider for React Query
  return (
    <QueryProvider>
      <Slot />
    </QueryProvider>
  );
}
