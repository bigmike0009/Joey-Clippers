import { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Text,
  Card,
  Button,
  FAB,
  Chip,
  Snackbar,
  Dialog,
  Portal,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/theme';
import { useAuth } from '@/lib/AuthContext';
import { useUpcomingShopDaysWithBookings } from '@/hooks/useBookings';
import { useCreateShopDay, useCancelShopDay, useUpdateShopDay, usePastShopDays } from '@/hooks/useShopDays';
import { useBookSlot, useCancelBooking, useJoinWaitlist } from '@/hooks/useBookings';
import { ShopDayFormModal } from '@/components/ShopDayFormModal';
import { LoadingState } from '@/components/LoadingState';
import { getBookingErrorMessage } from '@/lib/errors';
import { useMinimumLoading } from '@/hooks/useMinimumLoading';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { formatTime } from '@/lib/time';
import type { ShopDay, ShopDaySummary } from '@/types';

export default function HomeScreen() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const tabBarHeight = useTabBarHeight();
  const router = useRouter();

  const { data: shopDays, isLoading, isError, refetch, isRefetching } = useUpcomingShopDaysWithBookings();
  const showLoading = useMinimumLoading(isLoading);
  const { data: pastDays, refetch: refetchPast } = usePastShopDays();

  const createMutation = useCreateShopDay();
  const cancelDayMutation = useCancelShopDay();
  const updateShopDayMutation = useUpdateShopDay();
  const bookSlotMutation = useBookSlot();
  const cancelBookingMutation = useCancelBooking();
  const joinWaitlistMutation = useJoinWaitlist();

  const [formVisible, setFormVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<ShopDay | null>(null);
  const [cancelDayTarget, setCancelDayTarget] = useState<ShopDaySummary | null>(null);
  const [snackMessage, setSnackMessage] = useState('');

  const existingDates = shopDays?.filter(d => d.status === 'open').map(d => d.date) ?? [];

  async function handleCreate(date: string, startTime: string, slotCount: number, notes?: string) {
    const { error } = await createMutation.mutateAsync({ date, startTime, slotCount, notes });
    if (error) {
      setSnackMessage('Could not create shop day. That date may already exist.');
    } else {
      setFormVisible(false);
      setSnackMessage('Shop day created!');
    }
  }

  async function handleEditShopDay(date: string, startTime: string, slotCount: number) {
    if (!editTarget) return;
    const { error } = await updateShopDayMutation.mutateAsync({ id: editTarget.id, startTime, slotCount });
    setEditTarget(null);
    setSnackMessage(error ? 'Could not update shop day.' : 'Shop day updated.');
  }

  async function handleCancelDay() {
    if (!cancelDayTarget) return;
    const { error } = await cancelDayMutation.mutateAsync(cancelDayTarget.id);
    setCancelDayTarget(null);
    setSnackMessage(error ? 'Could not cancel shop day.' : 'Shop day cancelled.');
  }

  async function handleBook(shopDayId: string) {
    const { error } = await bookSlotMutation.mutateAsync(shopDayId);
    if (error) {
      const code = (error as { message?: string }).message ?? '';
      setSnackMessage(getBookingErrorMessage(code));
    }
  }

  async function handleCancelBooking(bookingId: string) {
    const { error } = await cancelBookingMutation.mutateAsync(bookingId);
    if (error) setSnackMessage('Could not cancel booking. Please try again.');
  }

  async function handleJoinWaitlist(shopDayId: string) {
    const { error } = await joinWaitlistMutation.mutateAsync(shopDayId);
    if (error) setSnackMessage('Could not join waitlist. Please try again.');
    else setSnackMessage("You're on the waitlist! Joe will approve when a slot opens.");
  }

  if (showLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <LoadingState label="Loading shop days..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Button onPress={() => refetch()} textColor={colors.primary.default}>Retry</Button>
        </View>
      </SafeAreaView>
    );
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const openDays = shopDays?.filter(d => d.status === 'open') ?? [];
  const cancelledDays = shopDays?.filter(d => d.status === 'cancelled' && d.date >= cutoffStr) ?? [];
  const pastOpenDays = pastDays?.filter(d => d.status === 'open' && d.date >= cutoffStr) ?? [];
  const pastCancelledDays = pastDays?.filter(d => d.status === 'cancelled' && d.date >= cutoffStr) ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <FlatList
        data={openDays}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); refetchPast(); }}
            tintColor={colors.primary.default}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No open shop days</Text>
            <Text style={styles.emptyBody}>
              {isAdmin
                ? 'Tap + to open a new day.'
                : "Joe hasn't opened any days yet. Check back soon!"}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const remaining = item.slot_count - (item.confirmed_count ?? 0);
          const isFull = remaining <= 0;
          const isBooked = item.my_booking_status === 'confirmed';
          const isWaitlisted = item.my_booking_status === 'pending';

          return (
            <TouchableOpacity
              onPress={() => isAdmin && router.push(`/day-detail/${item.id}`)}
              activeOpacity={isAdmin ? 0.7 : 1}
            >
            <Card style={styles.card} mode="elevated">
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <View style={styles.dateGroup}>
                    <Text style={styles.dayDate}>{formatDate(item.date)}</Text>
                    <Text style={styles.dayTime}>{formatTime(item.start_time)}</Text>
                  </View>
                  {isFull ? (
                    <Chip compact style={styles.fullChip} textStyle={styles.fullChipText}>Full</Chip>
                  ) : (
                    <Chip compact style={styles.slotsChip} textStyle={styles.slotsChipText}>
                      {remaining} left
                    </Chip>
                  )}
                </View>

                {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}

                {!isAdmin && (
                  <View style={styles.memberAction}>
                    {isBooked ? (
                      <Button
                        mode="outlined"
                        compact
                        textColor={colors.semantic.error}
                        style={styles.cancelBookingBtn}
                        onPress={() => item.my_booking_id && handleCancelBooking(item.my_booking_id)}
                        loading={cancelBookingMutation.isPending}
                      >
                        Cancel Booking
                      </Button>
                    ) : isWaitlisted ? (
                      <Button
                        mode="outlined"
                        compact
                        textColor={colors.text.secondary}
                        style={styles.cancelBookingBtn}
                        onPress={() => item.my_waitlist_booking_id && handleCancelBooking(item.my_waitlist_booking_id)}
                        loading={cancelBookingMutation.isPending}
                      >
                        Leave Waitlist
                      </Button>
                    ) : isFull ? (
                      <Button
                        mode="outlined"
                        compact
                        onPress={() => handleJoinWaitlist(item.id)}
                        loading={joinWaitlistMutation.isPending}
                        textColor={colors.secondary.default}
                        style={styles.waitlistBtn}
                      >
                        Join Waitlist
                      </Button>
                    ) : (
                      <Button
                        mode="contained"
                        compact
                        disabled={bookSlotMutation.isPending}
                        onPress={() => handleBook(item.id)}
                        loading={bookSlotMutation.isPending}
                        buttonColor={colors.primary.default}
                        style={styles.bookBtn}
                      >
                        Book
                      </Button>
                    )}
                  </View>
                )}

                {isAdmin && (
                  <View style={styles.adminActions}>
                    <Button mode="text" compact textColor={colors.secondary.default}
                      onPress={() => setEditTarget(item as unknown as ShopDay)}>
                      Edit
                    </Button>
                    <Button mode="text" compact textColor={colors.semantic.error}
                      onPress={() => setCancelDayTarget(item)}>
                      Cancel day
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <>
            {cancelledDays.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cancelled</Text>
                {cancelledDays.map(item => (
                  <Card key={item.id} style={[styles.card, styles.cancelledCard]} mode="outlined">
                    <Card.Content style={styles.cardContent}>
                      <View style={styles.cardRow}>
                        <View style={styles.dateGroup}>
                          <Text style={[styles.dayDate, styles.cancelledText]}>{formatDate(item.date)}</Text>
                          <Text style={[styles.dayTime, styles.cancelledText]}>{formatTime(item.start_time)}</Text>
                        </View>
                        <Chip compact style={styles.cancelledChip} textStyle={styles.cancelledChipText}>Cancelled</Chip>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            )}
            {(pastOpenDays.length > 0 || pastCancelledDays.length > 0) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past Days</Text>
                {[...pastOpenDays, ...pastCancelledDays]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(item => (
                    <Card key={item.id} style={[styles.card, styles.pastCard]} mode="outlined">
                      <Card.Content style={styles.cardContent}>
                        <View style={styles.cardRow}>
                          <View style={styles.dateGroup}>
                            <Text style={[styles.dayDate, styles.pastText]}>{formatDate(item.date)}</Text>
                            <Text style={[styles.dayTime, styles.pastText]}>{formatTime(item.start_time)}</Text>
                          </View>
                          {item.status === 'cancelled' && (
                            <Chip compact style={styles.cancelledChip} textStyle={styles.cancelledChipText}>Cancelled</Chip>
                          )}
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.list}
      />

      {isAdmin && (
        <FAB icon="plus" style={[styles.fab, { bottom: tabBarHeight + spacing[3] }]} color={colors.text.inverse} onPress={() => setFormVisible(true)} />
      )}

      <ShopDayFormModal
        visible={formVisible}
        onDismiss={() => setFormVisible(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
        existingDates={existingDates}
      />

      <ShopDayFormModal
        visible={!!editTarget}
        onDismiss={() => setEditTarget(null)}
        onSubmit={handleEditShopDay}
        loading={updateShopDayMutation.isPending}
        existing={editTarget}
      />

      <Portal>
        <Dialog visible={!!cancelDayTarget} onDismiss={() => setCancelDayTarget(null)}>
          <Dialog.Title>Cancel shop day?</Dialog.Title>
          <Dialog.Content>
            <Text>
              Cancel the shop day on {cancelDayTarget ? formatDate(cancelDayTarget.date) : ''}?
              Members who booked will lose their slot.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDayTarget(null)}>Keep it</Button>
            <Button textColor={colors.semantic.error} loading={cancelDayMutation.isPending}
              onPress={handleCancelDay}>
              Cancel day
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
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  errorText: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  list: { paddingTop: spacing[4], paddingBottom: spacing[16] },
  empty: { paddingHorizontal: spacing[6], paddingTop: spacing[12], alignItems: 'center', gap: spacing[2] },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, textAlign: 'center' },
  emptyBody: { fontSize: typography.fontSize.base, color: colors.text.secondary, textAlign: 'center', lineHeight: typography.fontSize.base * typography.lineHeight.normal },
  card: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    borderRadius: radius.lg,
    backgroundColor: colors.surface.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(128,30,23,0.14)',
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cancelledCard: { backgroundColor: colors.surface.cardMuted, opacity: 0.78 },
  cardContent: { gap: spacing[2] },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateGroup: { flex: 1, paddingRight: spacing[3] },
  dayDate: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  dayTime: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.secondary.default, marginTop: spacing[1] },
  cancelledText: { color: colors.text.disabled },
  slotsChip: { backgroundColor: colors.primary.light },
  slotsChipText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium },
  fullChip: { backgroundColor: 'rgba(39,39,42,0.1)' },
  fullChipText: { fontSize: typography.fontSize.xs, color: colors.text.secondary },
  cancelledChip: { backgroundColor: 'rgba(128,30,23,0.1)' },
  cancelledChipText: { fontSize: typography.fontSize.xs, color: colors.text.secondary },
  notes: { fontSize: typography.fontSize.sm, color: colors.text.secondary, fontStyle: 'italic' },
  memberAction: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing[1] },
  bookBtn: { borderRadius: radius.md },
  cancelBookingBtn: { borderColor: colors.semantic.error, borderRadius: radius.md },
  waitlistBtn: { borderColor: colors.secondary.default, borderRadius: radius.md },
  adminActions: { flexDirection: 'row', gap: spacing[1], marginTop: spacing[1] },
  section: { paddingTop: spacing[4] },
  pastCard: { backgroundColor: colors.surface.cardMuted, opacity: 0.72 },
  pastText: { color: colors.text.disabled },
  sectionTitle: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.secondary.dark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    backgroundColor: 'rgba(255,250,244,0.74)',
    borderRadius: radius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    marginLeft: spacing[4],
    marginBottom: spacing[2],
  },
  fab: {
    position: 'absolute',
    right: spacing[4],
    bottom: spacing[6],
    backgroundColor: colors.primary.default,
    borderRadius: radius.full,
    shadowColor: colors.neutral[900],
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
