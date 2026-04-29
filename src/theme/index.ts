import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: {
    default: '#B7271F',
    light: '#FFE7E1',
    dark: '#801E17',
  },
  secondary: {
    default: '#1E5A8C',
    light: '#E2F0FA',
    dark: '#12375A',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
  },
  semantic: {
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
  surface: {
    background: '#7B3F32',
    card: 'rgba(255,250,244,0.96)',
    cardMuted: 'rgba(255,238,226,0.66)',
    tabBar: 'rgba(255,250,246,0.96)',
    overlay: 'rgba(0,0,0,0.5)',
  },
  text: {
    primary: '#18181B',
    secondary: '#52525B',
    disabled: '#A1A1AA',
    inverse: '#FFFFFF',
  },
} as const;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary.default,
    primaryContainer: colors.primary.light,
    onPrimary: colors.text.inverse,
    secondary: colors.secondary.default,
    secondaryContainer: colors.secondary.light,
    onSecondary: colors.text.inverse,
    background: colors.surface.background,
    surface: colors.surface.card,
    surfaceVariant: colors.neutral[100],
    onSurface: colors.text.primary,
    onSurfaceVariant: colors.text.secondary,
    error: colors.semantic.error,
    errorContainer: '#FEE2E2',
    onError: colors.text.inverse,
    outline: colors.neutral[300],
    outlineVariant: colors.neutral[200],
  },
};
