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
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '@/store/authStore';
import { QueryProvider } from '@/hooks/QueryProvider';
import { onGoogleAuthStateChange } from '@/services/googleAuth';
import { createOrUpdateUser } from '@/services/userService';
import { supabase } from '@/services/supabase';

// Prevent auto-hiding splash screen until auth state is resolved
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // ---------- Auth State ----------
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

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
        // First, fetch latest user data from Supabase to get updated name
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, avatar')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (data) {
            // Merge Firebase user with Supabase data (preserve name from Supabase)
            setUser({ ...authUser, name: data.name || authUser.name });
          } else {
            // User doesn't exist in Supabase yet, create them
            try {
              await createOrUpdateUser(authUser);
              setUser(authUser);
            } catch (e) {
              console.error('[RootLayout] Failed to sync user to database:', e);
              setUser(authUser);
            }
          }
        } catch (e) {
          console.error('[RootLayout] Failed to fetch user from database:', e);
          setUser(authUser);
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
  if (isLoading || !fontsLoaded) {
    return null;
  }

  // Wrap app with QueryProvider for React Query
  return (
    <QueryProvider>
      <Slot />
    </QueryProvider>
  );
}
