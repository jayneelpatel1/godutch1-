/**
 * @hook useTheme
 * @description Returns the current theme color palette based on the system color scheme.
 *              Light or dark mode colors are selected automatically.
 *
 * @returns { typeof Colors.light } — The current theme's color object
 *
 * @dependencies useColorScheme (react-native), Colors (constants/theme)
 */
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}
