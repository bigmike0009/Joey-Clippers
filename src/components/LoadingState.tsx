import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BarberPoleLoader } from '@/components/BarberPoleLoader';
import { joeAvatarAssets } from '@/content/joeAvatarAssets';
import { colors, radius, spacing, typography } from '@/theme';

type LoadingStateProps = {
  label?: string;
  compact?: boolean;
};

export function LoadingState({ label, compact = false }: LoadingStateProps) {
  const joeAvatar = useMemo(() => {
    const avatarIndex = Math.floor(Math.random() * joeAvatarAssets.length);
    return joeAvatarAssets[avatarIndex];
  }, []);

  const poleSize = compact ? 44 : 62;
  const avatarHeight = compact ? 76 : 112;
  const avatarWidth = compact ? 44 : 66;

  return (
    <View style={[styles.centered, compact && styles.compact]}>
      <View style={[styles.panel, compact && styles.compactPanel]}>
        <View style={[styles.loaderRow, compact && styles.compactRow]}>
          <BarberPoleLoader size={poleSize} label="" compact />
          <Image
            source={joeAvatar}
            style={{ width: avatarWidth, height: avatarHeight }}
            resizeMode="contain"
          />
          <BarberPoleLoader size={poleSize} label="" compact />
        </View>

        {label ? (
          <Text style={[styles.label, compact && styles.compactLabel]}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  compact: {
    paddingHorizontal: spacing[3],
  },
  panel: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  compactPanel: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[4],
  },
  compactRow: {
    gap: spacing[3],
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  compactLabel: {
    fontSize: typography.fontSize.sm,
  },
});
