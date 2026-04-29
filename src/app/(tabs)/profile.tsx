import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Chip, Dialog, Portal, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuth } from '@/lib/AuthContext';
import { signOut, deleteAccount } from '@/services/auth';

export default function ProfileScreen() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  async function handleSignOut() {
    await signOut();
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    const { error } = await deleteAccount();
    setDeleteLoading(false);
    setShowDeleteDialog(false);
    if (error) {
      setSnackMessage('Could not delete account. Please try again.');
    }
    // On success, AuthContext signs out automatically via onAuthStateChange
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
      <View style={styles.profilePanel}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {profile.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.name}>{profile.full_name}</Text>

        <Chip
          style={[styles.roleChip, isAdmin ? styles.adminChip : styles.memberChip]}
          textStyle={styles.roleChipText}
          compact
        >
          {isAdmin ? 'Admin' : 'Member'}
        </Chip>

        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          contentStyle={styles.signOutContent}
          textColor={colors.semantic.error}
        >
          Sign Out
        </Button>

        <Button
          mode="text"
          onPress={() => setShowDeleteDialog(true)}
          textColor={colors.text.disabled}
          style={styles.deleteAccountBtn}
          labelStyle={styles.deleteAccountLabel}
        >
          Delete Account
        </Button>
      </View>

      <Portal>
        <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
          <Dialog.Title>Delete account?</Dialog.Title>
          <Dialog.Content>
            <Text>
              This permanently removes your account and all your bookings. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              textColor={colors.semantic.error}
              loading={deleteLoading}
              onPress={handleDeleteAccount}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackMessage} onDismiss={() => setSnackMessage('')} duration={3000}>
        {snackMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  profilePanel: {
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    gap: spacing[3],
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,250,244,0.88)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,30,23,0.16)',
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  avatarWrap: {
    padding: spacing[2],
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.66)',
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,250,244,0.95)',
  },
  avatarInitial: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  name: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  roleChip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
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
  signOutButton: {
    borderColor: colors.semantic.error,
    borderRadius: radius.md,
    marginTop: spacing[8],
    alignSelf: 'stretch',
  },
  signOutContent: {
    paddingVertical: spacing[1],
  },
  deleteAccountBtn: {
    marginTop: spacing[2],
  },
  deleteAccountLabel: {
    fontSize: typography.fontSize.sm,
  },
});
