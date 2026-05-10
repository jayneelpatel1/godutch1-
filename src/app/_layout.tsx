/**
 * @screen RootLayout
 * @description Root layout that initializes Firebase auth listener, manages splash screen,
 *              and redirects to auth or main routes based on user state.
 *
 * @route /
 * @auth Firebase Auth — listens to onAuthStateChanged
 *
 * @remarks
 *   - SplashScreen stays visible until auth state is resolved (prevents flash)
 *   - User is synced to Supabase on first login via createOrUpdateUser
 *   - Fonts (Ionicons) must load before rendering to avoid icon gaps
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

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const router = useRouter();
  const [fontsLoaded] = useFonts({ ...Ionicons.font });

  useEffect(() => {
    let mounted = true;
    const unsubscribe = onGoogleAuthStateChange(async (authUser) => {
      if (!mounted) return;
      if (authUser) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('id, name, email, avatar')
            .eq('id', authUser.id)
            .maybeSingle();
          if (error) console.error('[RootLayout] Error fetching user from Supabase:', error);
          if (data) {
            setUser({ ...authUser, name: data.name || authUser.name });
          } else {
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
    return () => { mounted = false; unsubscribe(); };
  }, [setUser, setLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (user) router.replace('/(main)');
    else router.replace('/(auth)/login');
  }, [isLoading, user, router]);

  if (isLoading || !fontsLoaded) return null;

  return (
    <QueryProvider>
      <Slot />
    </QueryProvider>
  );
}
