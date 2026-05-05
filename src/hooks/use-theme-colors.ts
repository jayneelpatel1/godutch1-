import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColors() {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}

// Helper to create dynamic styles
export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (colors: typeof Colors.light) => T
) {
  // This will be called with current theme colors
  return (colors: typeof Colors.light) => StyleSheet.create(createStyles(colors));
}
