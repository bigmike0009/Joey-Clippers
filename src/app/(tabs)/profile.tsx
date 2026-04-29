import { View, StyleSheet } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuth } from '@/lib/AuthContext';
import { signOut } from '@/services/auth';
import { BarberPoleLoader } from '@/components/BarberPoleLoader';

export default function ProfileScreen() {
  const { profile } = useAuth();

  const isAdmin = profile?.role === 'admin';

  async function handleSignOut() {
    await signOut();
    // Navigation handled by AuthContext in _layout.tsx
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.placeholderText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {profile.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{profile.full_name}</Text>

        <Chip
          style={[styles.roleChip, isAdmin ? styles.adminChip : styles.memberChip]}
          textStyle={styles.roleChipText}
          compact
        >
          {isAdmin ? 'Admin' : 'Member'}
        </Chip>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.previewSection}>
        <Text style={styles.previewTitle}>Loader Preview</Text>
        <BarberPoleLoader size={96} label="Loading appointments..." />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          contentStyle={styles.signOutContent}
          textColor={colors.semantic.error}
        >
          Sign Out
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  name: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  roleChip: {
    borderRadius: radius.full,
  },
  adminChip: {
    backgroundColor: colors.primary.light,
  },
  memberChip: {
    backgroundColor: colors.neutral[200],
  },
  roleChipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  divider: {
    marginHorizontal: spacing[4],
  },
  section: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
  },
  previewSection: {
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
    gap: spacing[3],
  },
  previewTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  signOutButton: {
    borderColor: colors.semantic.error,
    borderRadius: radius.md,
  },
  signOutContent: {
    paddingVertical: spacing[1],
  },
});
