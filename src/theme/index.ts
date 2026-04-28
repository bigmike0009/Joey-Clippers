import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';

export { colors, typography, spacing, radius };

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
