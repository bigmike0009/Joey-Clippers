import { StyleSheet, View } from 'react-native';
import { BarberPoleLoader } from '@/components/BarberPoleLoader';
import { spacing } from '@/theme';

type LoadingStateProps = {
  label?: string;
  compact?: boolean;
};

export function LoadingState({ label, compact = false }: LoadingStateProps) {
  return (
    <View style={[styles.centered, compact && styles.compact]}>
      <BarberPoleLoader size={compact ? 52 : 76} label={label} compact={compact} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  compact: {
    paddingHorizontal: spacing[3],
  },
});
