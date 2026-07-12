import '@/global.css';

import { Platform } from 'react-native';

export const NeoColors = {
  primary: '#FF6600',
  primaryGlow: '#FF8533',
  primaryDark: '#CC5200',
  background: '#0B0D13',
  card: '#161923',
  cardElevated: '#1E2233',
  cardBorder: '#252A3E',
  cardBorderOrange: '#FF660044',
  text: '#FFFFFF',
  textSecondary: '#A0A6B2',
  textMuted: '#687082',
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  info: '#3B82F6',
  infoBg: 'rgba(59, 130, 246, 0.12)',
};

export const Colors = {
  light: {
    ...NeoColors,
    text: '#FFFFFF',
    background: '#0B0D13',
    backgroundElement: '#161923',
    backgroundSelected: '#FF6600',
    textSecondary: '#A0A6B2',
  },
  dark: {
    ...NeoColors,
    text: '#FFFFFF',
    background: '#0B0D13',
    backgroundElement: '#161923',
    backgroundSelected: '#FF6600',
    textSecondary: '#A0A6B2',
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

export const BottomTabInset = Platform.select({ ios: 60, android: 80 }) ?? 60;
export const MaxContentWidth = 800;
