import { useEffect } from 'react';
import { Slot, router } from 'expo-router';
import { SplashScreen } from 'expo-router';

import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar: session.user.user_metadata?.avatar,
          });
          router.replace('/(main)');
        } else {
          setUser(null);
          router.replace('/(auth)/login');
        }
      } catch {
        setUser(null);
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
        await SplashScreen.hideAsync();
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          avatar: session.user.user_metadata?.avatar,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return null;
  }

  return <Slot />;
}
