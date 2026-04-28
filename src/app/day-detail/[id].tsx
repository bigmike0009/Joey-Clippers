import { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import {
  Text, List, Button, Divider, ActivityIndicator, Snackbar,
  Dialog, Portal, Chip,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, typography, radius } from '@/theme';
import { useBookingsForDay, useCancelBooking } from '@/hooks/useBookings';
import { useCancelShopDay, useUpcomingShopDays } from '@/hooks/useShopDays';

type BookingWithProfile = {
  id: string;
  member_id: string;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
};

export default function DayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: shopDays } = useUpcomingShopDays();
  const { data: bookings, isLoading, isError, refetch, isRefetching } = useBookingsForDay(id);
  const cancelBookingMutation = useCancelBooking();
  const cancelDayMutation = useCancelShopDay();

  const [confirmCancelBooking, setConfirmCancelBooking] = useState<BookingWithProfile | null>(null);
  const [showCancelDay, setShowCancelDay] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const shopDay = shopDays?.find(d => d.id === id);
  const confirmedCount = bookings?.length ?? 0;

  async function handleCancelBooking() {
    if (!confirmCancelBooking) return;
    const { error } = await cancelBookingMutation.mutateAsync(confirmCancelBooking.id);
    setConfirmCancelBooking(null);
    setSnackMessage(error ? 'Could not cancel booking.' : 'Booking cancelled.');
  }

  async function handleCancelDay() {
    setShowCancelDay(false);
    const { error } = await cancelDayMutation.mutateAsync(id);
    if (error) {
      setSnackMessage('Could not cancel shop day.');
    } else {
      setSnackMessage('Shop day cancelled.');
      router.back();
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}><ActivityIndicator color={colors.primary.default} /></View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Button onPress={() => refetch()} textColor={colors.primary.default}>Retry</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={(bookings ?? []) as BookingWithProfile[]}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.default} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.summary}>
              {shopDay && (
                <Text style={styles.dateText}>{formatDate(shopDay.date)}</Text>
              )}
              <View style={styles.utilRow}>
                <Text style={styles.utilLabel}>Slots booked</Text>
                <Chip compact style={styles.utilChip} textStyle={styles.utilChipText}>
                  {confirmedCount} / {shopDay?.slot_count ?? '?'}
                </Chip>
              </View>
              {shopDay?.notes ? (
                <Text style={styles.notes}>{shopDay.notes}</Text>
              ) : null}
            </View>
            <Divider />
            {confirmedCount === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No bookings yet</Text>
              </View>
            ) : (
              <Text style={styles.sectionLabel}>Confirmed Bookings</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.profiles?.full_name ?? 'Unknown'}
            titleStyle={styles.memberName}
            style={styles.listItem}
            right={() => (
              <Button
                mode="text"
                compact
                textColor={colors.semantic.error}
                onPress={() => setConfirmCancelBooking(item)}
                disabled={cancelBookingMutation.isPending}
              >
                Remove
              </Button>
            )}
          />
        )}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        ListFooterComponent={
          shopDay?.status === 'open' ? (
            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={() => setShowCancelDay(true)}
                style={styles.cancelDayBtn}
                textColor={colors.semantic.error}
                loading={cancelDayMutation.isPending}
              >
                Cancel Entire Day
              </Button>
            </View>
          ) : (
            <View style={styles.footer}>
              <Chip style={styles.cancelledBadge} textStyle={styles.cancelledBadgeText}>
                This day has been cancelled
              </Chip>
            </View>
          )
        }
      />

      <Portal>
        <Dialog visible={!!confirmCancelBooking} onDismiss={() => setConfirmCancelBooking(null)}>
          <Dialog.Title>Remove booking?</Dialog.Title>
          <Dialog.Content>
            <Text>
              Remove {confirmCancelBooking?.profiles?.full_name ?? 'this member'} from the day?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmCancelBooking(null)}>Keep</Button>
            <Button
              textColor={colors.semantic.error}
              loading={cancelBookingMutation.isPending}
              onPress={handleCancelBooking}
            >
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showCancelDay} onDismiss={() => setShowCancelDay(false)}>
          <Dialog.Title>Cancel entire day?</Dialog.Title>
          <Dialog.Content>
            <Text>Cancel this shop day? All {confirmedCount} member(s) will lose their slot.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCancelDay(false)}>Keep it</Button>
            <Button
              textColor={colors.semantic.error}
              loading={cancelDayMutation.isPending}
              onPress={handleCancelDay}
            >
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
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  errorText: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  summary: { padding: spacing[4], gap: spacing[3] },
  dateText: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  utilRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  utilLabel: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  utilChip: { backgroundColor: colors.primary.light },
  utilChipText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
  notes: { fontSize: typography.fontSize.sm, color: colors.text.secondary, fontStyle: 'italic' },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  empty: { padding: spacing[6], alignItems: 'center' },
  emptyText: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  listItem: { paddingHorizontal: spacing[4], backgroundColor: colors.surface.card },
  memberName: { fontSize: typography.fontSize.base, color: colors.text.primary },
  divider: { marginLeft: spacing[4] },
  footer: { padding: spacing[6], alignItems: 'center' },
  cancelDayBtn: { borderColor: colors.semantic.error, borderRadius: radius.md, width: '100%' },
  cancelledBadge: { backgroundColor: '#FEE2E2' },
  cancelledBadgeText: { color: colors.semantic.error },
});
