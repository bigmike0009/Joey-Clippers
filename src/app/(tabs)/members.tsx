import { useState } from 'react';
import { View, SectionList, StyleSheet, Share, RefreshControl } from 'react-native';
import {
  Text, List, Button, Divider, FAB, Snackbar,
  Dialog, Portal, Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/theme';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useAuth } from '@/lib/AuthContext';
import { useAllProfiles, useRevokeMember, useInviteList, useGenerateInvite, useDeleteInvite } from '@/hooks/useProfiles';
import { LoadingState } from '@/components/LoadingState';
import { useMinimumLoading } from '@/hooks/useMinimumLoading';
import type { Profile, Invite } from '@/types';

const INVITE_SCHEME = 'https://wdyseexaijxwmqukjbde.supabase.co/functions/v1/invite-landing';

export default function MembersScreen() {
  const { profile: myProfile } = useAuth();
  const tabBarHeight = useTabBarHeight();

  const { data: profiles, isLoading: profilesLoading, isError: profilesError, refetch: refetchProfiles, isRefetching } = useAllProfiles();
  const { data: invites, isLoading: invitesLoading, refetch: refetchInvites } = useInviteList();
  const showLoading = useMinimumLoading(profilesLoading || invitesLoading);

  const revokeMutation = useRevokeMember();
  const generateInviteMutation = useGenerateInvite();
  const deleteInviteMutation = useDeleteInvite();

  const [revokeTarget, setRevokeTarget] = useState<Profile | null>(null);
  const [snackMessage, setSnackMessage] = useState('');

  async function handleGenerateInvite() {
    const { data: token, error } = await generateInviteMutation.mutateAsync({});
    if (error || !token) { setSnackMessage('Could not generate invite.'); return; }

    const url = `${INVITE_SCHEME}?token=${token}`;
    await Share.share({ message: `You've been invited to Joe's Clippers ✂️\n\nTap the link to get the app and create your account:\n${url}` });
    refetchInvites();
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    const { error } = await revokeMutation.mutateAsync(revokeTarget.id);
    setRevokeTarget(null);
    setSnackMessage(error ? 'Could not revoke member.' : `${revokeTarget.full_name} revoked.`);
  }

  async function handleDeleteInvite(id: string) {
    const { error } = await deleteInviteMutation.mutateAsync(id);
    if (error) setSnackMessage('Could not delete invite.');
  }

  if (showLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.header}><Text style={styles.title}>Members</Text></View>
        <LoadingState label="Loading members..." />
      </SafeAreaView>
    );
  }

  if (profilesError) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.header}><Text style={styles.title}>Members</Text></View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Button onPress={() => refetchProfiles()} textColor={colors.primary.default}>Retry</Button>
        </View>
      </SafeAreaView>
    );
  }

  const members = profiles?.filter(p => p.id !== myProfile?.id) ?? [];
  const pendingInvites = invites?.filter(i => !i.used_by && (!i.expires_at || new Date(i.expires_at) > new Date())) ?? [];

  type Section = { title: string; data: (Profile | Invite)[]; type: 'member' | 'invite' };

  const sections: Section[] = [
    { title: `Members (${members.length})`, data: members, type: 'member' },
    ...(pendingInvites.length > 0
      ? [{ title: 'Pending Invites', data: pendingInvites, type: 'invite' as const }]
      : []),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => { refetchProfiles(); refetchInvites(); }} tintColor={colors.primary.default} />
        }
        ListHeaderComponent={
          <View style={styles.header}><Text style={styles.title}>Members</Text></View>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item, section }) => {
          if ((section as Section).type === 'member') {
            const p = item as Profile;
            if (p.id === myProfile?.id) return null;
            return (
              <>
                <List.Item
                  title={p.full_name}
                  titleStyle={styles.memberName}
                  description={`Joined ${formatDate(p.created_at)}`}
                  descriptionStyle={styles.memberJoined}
                  style={styles.listItem}
                  right={() => (
                    <Button
                      mode="text"
                      compact
                      textColor={colors.semantic.error}
                      onPress={() => setRevokeTarget(p)}
                      disabled={revokeMutation.isPending}
                    >
                      Revoke
                    </Button>
                  )}
                />
                <Divider style={styles.divider} />
              </>
            );
          } else {
            const inv = item as Invite;
            return (
              <>
                <List.Item
                  title={inv.email ?? 'No email hint'}
                  titleStyle={styles.inviteEmail}
                  description={`Created ${formatDate(inv.created_at)}`}
                  descriptionStyle={styles.memberJoined}
                  style={styles.listItem}
                  left={() => (
                    <Chip compact style={styles.pendingChip} textStyle={styles.pendingChipText}>
                      Pending
                    </Chip>
                  )}
                  right={() => (
                    <Button
                      mode="text"
                      compact
                      textColor={colors.text.secondary}
                      onPress={() => handleDeleteInvite(inv.id)}
                      disabled={deleteInviteMutation.isPending}
                    >
                      Delete
                    </Button>
                  )}
                />
                <Divider style={styles.divider} />
              </>
            );
          }
        }}
        ListEmptyComponent={
          members.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No members yet. Generate an invite!</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="account-plus"
        style={[styles.fab, { bottom: tabBarHeight + spacing[3] }]}
        color={colors.text.inverse}
        label="Invite"
        onPress={handleGenerateInvite}
        loading={generateInviteMutation.isPending}
      />

      <Portal>
        <Dialog visible={!!revokeTarget} onDismiss={() => setRevokeTarget(null)}>
          <Dialog.Title>Revoke member?</Dialog.Title>
          <Dialog.Content>
            <Text>
              Remove {revokeTarget?.full_name} from Joe's Clippers? They won't be able to sign in again.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRevokeTarget(null)}>Cancel</Button>
            <Button
              textColor={colors.semantic.error}
              loading={revokeMutation.isPending}
              onPress={handleRevoke}
            >
              Revoke
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2] },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  errorText: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  list: { paddingBottom: spacing[16] },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
    backgroundColor: 'rgba(255,255,255,0.82)',
  },
  listItem: { paddingHorizontal: spacing[4], backgroundColor: colors.surface.card },
  memberName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: colors.text.primary },
  memberJoined: { fontSize: typography.fontSize.sm, color: colors.text.secondary },
  inviteEmail: { fontSize: typography.fontSize.base, color: colors.text.primary },
  divider: { marginLeft: spacing[4] },
  empty: { padding: spacing[8], alignItems: 'center' },
  emptyText: { fontSize: typography.fontSize.base, color: colors.text.secondary, textAlign: 'center' },
  pendingChip: { backgroundColor: colors.neutral[200], alignSelf: 'center', marginLeft: spacing[2] },
  pendingChipText: { fontSize: typography.fontSize.xs, color: colors.text.secondary },
  fab: { position: 'absolute', right: spacing[4], bottom: spacing[6], backgroundColor: colors.primary.default, borderRadius: radius.full },
});
