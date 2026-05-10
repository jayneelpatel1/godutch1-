import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * @hook useColorScheme
 * @description Web-specific color scheme hook that handles SSR hydration.
 *              Returns 'light' during SSR to avoid mismatch, then re-renders
 *              with the actual system preference once hydrated.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
