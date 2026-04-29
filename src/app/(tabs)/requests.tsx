import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Platform, RefreshControl, Keyboard, ScrollView, Dimensions, KeyboardAvoidingView } from 'react-native';
import {
  Text, Card, Button, Chip, FAB, ActivityIndicator, Portal, Modal,
  TextInput, HelperText, Snackbar, Badge,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuth } from '@/lib/AuthContext';
import { useMyDayRequests, useAllDayRequests, useSubmitDayRequest, useRespondToDayRequest, useApproveDayRequest } from '@/hooks/useDayRequests';
import type { DayRequest } from '@/types';

export default function RequestsScreen() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return isAdmin ? <AdminRequestsView /> : <MemberRequestsView />;
}

// ─── Member View ─────────────────��─────────────────────────────────��──────────

const SCREEN_HEIGHT = Dimensions.get('window').height;

function MemberRequestsView() {
  const { data: requests, isLoading, isError, refetch, isRefetching } = useMyDayRequests();
  const submitMutation = useSubmitDayRequest();

  const [formVisible, setFormVisible] = useState(false);
  const [date, setDate] = useState(tomorrow());
  const [showPicker, setShowPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [dateError, setDateError] = useState('');
  const [snackMessage, setSnackMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => { if (!formVisible) { setNotes(''); setDate(tomorrow()); setDateError(''); } }, [formVisible]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, e => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  async function handleSubmit() {
    const dateStr = toDateString(date);
    const today = toDateString(new Date());
    if (dateStr <= today) { setDateError('Date must be in the future.'); return; }

    const dupe = requests?.find(r => r.requested_date === dateStr && r.status === 'pending');
    if (dupe) { setDateError('You already have a pending request for that date.'); return; }

    setDateError('');
    const { error } = await submitMutation.mutateAsync({ date: dateStr, notes: notes.trim() || undefined });
    if (error) {
      const msg = (error as { message?: string }).message ?? '';
      setSnackMessage(msg.includes('unique') ? 'You already requested that date.' : 'Could not submit request.');
    } else {
      setFormVisible(false);
      setSnackMessage('Request submitted!');
    }
  }

  if (isLoading) return <ScreenShell title="Requests"><View style={styles.centered}><ActivityIndicator color={colors.primary.default} /></View></ScreenShell>;
  if (isError) return <ScreenShell title="Requests"><View style={styles.centered}><Text style={styles.errorText}>Something went wrong.</Text><Button onPress={() => refetch()} textColor={colors.primary.default}>Retry</Button></View></ScreenShell>;

  return (
    <ScreenShell title="Requests">
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.default} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptyBody}>Tap + to suggest a day for Joe to open.</Text>
          </View>
        }
        renderItem={({ item }) => <RequestCard request={item} />}
        contentContainerStyle={styles.list}
      />

      <FAB icon="plus" style={styles.fab} color={colors.text.inverse} onPress={() => setFormVisible(true)} />

      <Portal>
        <Modal
          visible={formVisible}
          onDismiss={() => setFormVisible(false)}
          contentContainerStyle={[
            styles.modal,
            {
              maxHeight: SCREEN_HEIGHT - keyboardHeight - spacing[8],
              transform: [{ translateY: keyboardHeight > 0 ? -(keyboardHeight / 2) : 0 }],
            },
          ]}
        >
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Request a Day</Text>

            <Text style={styles.label}>Date</Text>
            <Button mode="outlined" onPress={() => setShowPicker(true)} style={styles.dateButton} textColor={colors.text.primary}>
              {formatDisplayDate(date)}
            </Button>
            {dateError ? <HelperText type="error">{dateError}</HelperText> : null}

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={tomorrow()}
                onChange={(_e, d) => { setShowPicker(Platform.OS === 'ios'); if (d) setDate(d); }}
              />
            )}

            <TextInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={styles.input}
              outlineColor={colors.neutral[300]}
              activeOutlineColor={colors.primary.default}
              placeholder="e.g. Saturday mornings work best"
            />

            <View style={styles.modalActions}>
              <Button onPress={() => setFormVisible(false)} textColor={colors.text.secondary}>Cancel</Button>
              <Button mode="contained" onPress={handleSubmit} loading={submitMutation.isPending} disabled={submitMutation.isPending} buttonColor={colors.primary.default}>
                Submit
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      <Snackbar visible={!!snackMessage} onDismiss={() => setSnackMessage('')} duration={3000}>{snackMessage}</Snackbar>
    </ScreenShell>
  );
}

// ─── Admin View ───────────────────���───────────────────────────────────��───────

function AdminRequestsView() {
  const { data: requests, isLoading, isError, refetch, isRefetching } = useAllDayRequests();
  const declineMutation = useRespondToDayRequest();
  const approveMutation = useApproveDayRequest();

  const [approvingRequest, setApprovingRequest] = useState<(DayRequest & { profiles: { full_name: string } | null }) | null>(null);
  const [slotCount, setSlotCount] = useState('3');
  const [slotCountError, setSlotCountError] = useState('');
  const [snackMessage, setSnackMessage] = useState('');

  const pendingCount = requests?.filter(r => r.status === 'pending').length ?? 0;

  async function handleDecline(id: string) {
    const { error } = await declineMutation.mutateAsync({ id, status: 'declined' });
    setSnackMessage(error ? 'Could not decline. Try again.' : 'Request declined.');
  }

  async function handleApproveSubmit() {
    if (!approvingRequest) return;
    const count = parseInt(slotCount, 10);
    if (!count || count < 1 || count > 20) {
      setSlotCountError('Enter a number between 1 and 20.');
      return;
    }
    setSlotCountError('');
    const { error } = await approveMutation.mutateAsync({ requestId: approvingRequest.id, slotCount: count });
    if (error) {
      setSnackMessage('Could not approve. Try again.');
    } else {
      setApprovingRequest(null);
      setSnackMessage('Request approved — shop day created!');
    }
  }

  if (isLoading) return <ScreenShell title="Requests" badge={0}><View style={styles.centered}><ActivityIndicator color={colors.primary.default} /></View></ScreenShell>;
  if (isError) return <ScreenShell title="Requests" badge={0}><View style={styles.centered}><Text style={styles.errorText}>Something went wrong.</Text><Button onPress={() => refetch()} textColor={colors.primary.default}>Retry</Button></View></ScreenShell>;

  const pending = requests?.filter(r => r.status === 'pending') ?? [];
  const responded = requests?.filter(r => r.status !== 'pending') ?? [];

  return (
    <ScreenShell title="Requests" badge={pendingCount}>
      <FlatList
        data={[...pending, ...responded]}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.default} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No requests</Text>
            <Text style={styles.emptyBody}>Members can suggest days here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AdminRequestCard
            request={item as DayRequest & { profiles: { full_name: string } | null }}
            onApprove={() => {
              setSlotCount('3');
              setSlotCountError('');
              setApprovingRequest(item as DayRequest & { profiles: { full_name: string } | null });
            }}
            onDecline={() => handleDecline(item.id)}
            responding={declineMutation.isPending || approveMutation.isPending}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <Portal>
        <Modal
          visible={!!approvingRequest}
          onDismiss={() => setApprovingRequest(null)}
          contentContainerStyle={styles.modal}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Open Shop Day</Text>
              {approvingRequest && (
                <Text style={styles.modalSubtitle}>
                  {formatDate(approvingRequest.requested_date)} — requested by {approvingRequest.profiles?.full_name ?? 'Unknown'}
                </Text>
              )}
              <TextInput
                label="Number of slots"
                value={slotCount}
                onChangeText={text => { setSlotCount(text.replace(/[^0-9]/g, '')); setSlotCountError(''); }}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                outlineColor={colors.neutral[300]}
                activeOutlineColor={colors.primary.default}
              />
              {slotCountError ? <HelperText type="error">{slotCountError}</HelperText> : null}
              <View style={styles.modalActions}>
                <Button onPress={() => setApprovingRequest(null)} textColor={colors.text.secondary}>Cancel</Button>
                <Button
                  mode="contained"
                  onPress={handleApproveSubmit}
                  loading={approveMutation.isPending}
                  disabled={approveMutation.isPending}
                  buttonColor={colors.secondary.default}
                >
                  Open Day
                </Button>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      <Snackbar visible={!!snackMessage} onDismiss={() => setSnackMessage('')} duration={3000}>{snackMessage}</Snackbar>
    </ScreenShell>
  );
}

// ─── Shared Components ─────────────────────���──────────────────────────────────

function ScreenShell({ title, badge, children }: { title: string; badge?: number; children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          {badge != null && badge > 0 && (
            <Badge style={styles.badge}>{badge}</Badge>
          )}
        </View>
      </View>
      <View style={styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

function RequestCard({ request }: { request: DayRequest }) {
  const statusColors: Record<string, string> = {
    pending: colors.neutral[200],
    approved: '#D1FAE5',
    declined: '#FEE2E2',
  };
  const statusTextColors: Record<string, string> = {
    pending: colors.text.secondary,
    approved: '#065F46',
    declined: colors.semantic.error,
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardRow}>
          <Text style={styles.cardDate}>{formatDate(request.requested_date)}</Text>
          <Chip
            compact
            style={[styles.statusChip, { backgroundColor: statusColors[request.status] }]}
            textStyle={[styles.statusChipText, { color: statusTextColors[request.status] }]}
          >
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Chip>
        </View>
        {request.notes ? <Text style={styles.notes}>{request.notes}</Text> : null}
      </Card.Content>
    </Card>
  );
}

function AdminRequestCard({
  request,
  onApprove,
  onDecline,
  responding,
}: {
  request: DayRequest & { profiles: { full_name: string } | null };
  onApprove: () => void;
  onDecline: () => void;
  responding: boolean;
}) {
  const isPending = request.status === 'pending';

  return (
    <Card style={[styles.card, !isPending && styles.dimCard]} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardRow}>
          <View style={styles.flex}>
            <View style={styles.requestTypeRow}>
              <Chip compact style={styles.newDayChip} textStyle={styles.newDayChipText}>New Day</Chip>
            </View>
            <Text style={styles.cardDate}>{formatDate(request.requested_date)}</Text>
            <Text style={styles.memberName}>{request.profiles?.full_name ?? 'Unknown'}</Text>
          </View>
          {!isPending && (
            <Chip
              compact
              style={[styles.statusChip, { backgroundColor: request.status === 'approved' ? '#D1FAE5' : '#FEE2E2' }]}
              textStyle={[styles.statusChipText, { color: request.status === 'approved' ? '#065F46' : colors.semantic.error }]}
            >
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Chip>
          )}
        </View>
        {request.notes ? <Text style={styles.notes}>{request.notes}</Text> : null}
        {isPending && (
          <View style={styles.adminActions}>
            <Button mode="contained" compact onPress={onApprove} loading={responding} disabled={responding} buttonColor={colors.secondary.default} style={styles.respondBtn}>
              Approve
            </Button>
            <Button mode="outlined" compact onPress={onDecline} disabled={responding} textColor={colors.semantic.error} style={styles.declineBtn}>
              Decline
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

// ─── Helpers ──────────────────���─────────────────────────────────────���─────────

function tomorrow() { const d = new Date(); d.setDate(d.getDate() + 1); return d; }
function toDateString(d: Date) { return d.toISOString().split('T')[0]; }
function formatDisplayDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2] },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  badge: { backgroundColor: colors.semantic.error, alignSelf: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  errorText: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  list: { paddingBottom: spacing[16] },
  empty: { paddingHorizontal: spacing[6], paddingTop: spacing[12], alignItems: 'center', gap: spacing[2] },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  emptyBody: { fontSize: typography.fontSize.base, color: colors.text.secondary, textAlign: 'center' },
  card: { marginHorizontal: spacing[4], marginBottom: spacing[3], borderRadius: radius.lg, backgroundColor: colors.surface.card },
  dimCard: { opacity: 0.7 },
  cardContent: { gap: spacing[2] },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  requestTypeRow: { marginBottom: spacing[1] },
  newDayChip: { backgroundColor: colors.primary.light, alignSelf: 'flex-start' },
  newDayChipText: { fontSize: typography.fontSize.xs, color: colors.primary.dark, fontWeight: typography.fontWeight.medium },
  cardDate: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  memberName: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing[1] },
  notes: { fontSize: typography.fontSize.sm, color: colors.text.secondary, fontStyle: 'italic' },
  statusChip: { borderRadius: radius.full },
  statusChipText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  adminActions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[1] },
  respondBtn: { borderRadius: radius.md },
  declineBtn: { borderColor: colors.semantic.error, borderRadius: radius.md },
  fab: { position: 'absolute', right: spacing[4], bottom: spacing[6], backgroundColor: colors.primary.default, borderRadius: radius.full },
  modal: { backgroundColor: colors.surface.card, margin: spacing[4], borderRadius: radius.xl, padding: spacing[6], gap: spacing[3] },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing[1] },
  modalSubtitle: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] },
  label: { fontSize: typography.fontSize.sm, color: colors.text.secondary },
  dateButton: { borderColor: colors.neutral[300], borderRadius: radius.md },
  input: { backgroundColor: colors.surface.card },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing[2], marginTop: spacing[2] },
});
