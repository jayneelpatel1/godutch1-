/**
 * @file Theme constants.
 * @description Defines colors, fonts, spacing, and layout constants for the entire app.
 *              Light and dark mode color palettes are defined here.
 *
 * @usage
 *   import { Colors, Spacing } from '@/constants/theme';
 *   const theme = useTheme(); // Returns Colors[light|dark]
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#4F46E5',
    success: '#059669',
    danger: '#DC2626',
    warning: '#D97706',
    text: '#1E1B4B',
    background: '#FFFFFF',
    backgroundElement: '#F1F5F9',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
  },
  dark: {
    primary: '#818CF8',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    text: '#F8FAFC',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
export const BorderRadius = 12;
