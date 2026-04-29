import { View, SectionList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/theme';
import { useMyBookings } from '@/hooks/useBookings';
import { LoadingState } from '@/components/LoadingState';
import { useMinimumLoading } from '@/hooks/useMinimumLoading';
import { formatTime } from '@/lib/time';
import type { MyBookingRow } from '@/types';

type Section = { title: string; data: MyBookingRow[] };

export default function BookingsScreen() {
  const { data: bookings, isLoading, isError, refetch, isRefetching } = useMyBookings();
  const showLoading = useMinimumLoading(isLoading);

  if (showLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <LoadingState label="Loading bookings..." />
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

  const today = new Date().toISOString().split('T')[0];
  const confirmed = bookings?.filter(b => b.booking_status === 'confirmed') ?? [];
  const upcoming = confirmed.filter(b => b.date >= today);
  const past = confirmed.filter(b => b.date < today);

  const sections: Section[] = [];
  if (upcoming.length) sections.push({ title: 'Upcoming', data: upcoming });
  if (past.length) sections.push({ title: 'Past', data: past });

  if (!sections.length) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyBody}>Head to Shop Days to book your next cut.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.booking_id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.default} />
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

function BookingCard({ booking }: { booking: MyBookingRow }) {
  const isPast = booking.date < new Date().toISOString().split('T')[0];
  const isCancelled = booking.shop_day_status === 'cancelled';

  return (
    <Card
      style={[styles.card, (isPast || isCancelled) && styles.dimCard]}
      mode="elevated"
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.cardRow}>
          <View style={styles.dateGroup}>
            <Text style={[styles.cardDate, (isPast || isCancelled) && styles.dimText]}>
              {formatDate(booking.date)}
            </Text>
            <Text style={[styles.cardTime, (isPast || isCancelled) && styles.dimText]}>
              {formatTime(booking.start_time)}
            </Text>
          </View>
          {isCancelled && (
            <Chip compact style={styles.cancelledChip} textStyle={styles.cancelledChipText}>
              Day cancelled
            </Chip>
          )}
        </View>
        {booking.notes ? (
          <Text style={styles.notes}>{booking.notes}</Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  errorText: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  emptyBody: { fontSize: typography.fontSize.base, color: colors.text.secondary, textAlign: 'center' },
  list: { paddingTop: spacing[2], paddingBottom: spacing[8] },
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
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
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
  dimCard: { backgroundColor: colors.surface.cardMuted, opacity: 0.76 },
  cardContent: { gap: spacing[1] },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateGroup: { flex: 1, paddingRight: spacing[3] },
  cardDate: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  cardTime: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.secondary.default, marginTop: spacing[1] },
  dimText: { color: colors.text.disabled },
  notes: { fontSize: typography.fontSize.sm, color: colors.text.secondary, fontStyle: 'italic' },
  cancelledChip: { backgroundColor: '#FEE2E2' },
  cancelledChipText: { fontSize: typography.fontSize.xs, color: colors.semantic.error },
});
