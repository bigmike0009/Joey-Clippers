import { View, SectionList, StyleSheet, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '@/theme';
import { useMyBookings } from '@/hooks/useBookings';
import type { MyBookingRow } from '@/types';

type Section = { title: string; data: MyBookingRow[] };

export default function BookingsScreen() {
  const { data: bookings, isLoading, isError, refetch, isRefetching } = useMyBookings();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
        <View style={styles.centered}><ActivityIndicator color={colors.primary.default} /></View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
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
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No bookings yet</Text>
          <Text style={styles.emptyBody}>Head to Shop Days to book your next cut.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.booking_id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.default} />
        }
        ListHeaderComponent={
          <View style={styles.header}><Text style={styles.title}>My Bookings</Text></View>
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
          <Text style={[styles.cardDate, (isPast || isCancelled) && styles.dimText]}>
            {formatDate(booking.date)}
          </Text>
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
  header: { paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[2] },
  title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  errorText: { fontSize: typography.fontSize.base, color: colors.text.secondary },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.text.primary },
  emptyBody: { fontSize: typography.fontSize.base, color: colors.text.secondary, textAlign: 'center' },
  list: { paddingBottom: spacing[8] },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  card: { marginHorizontal: spacing[4], marginBottom: spacing[3], borderRadius: radius.lg, backgroundColor: colors.surface.card },
  dimCard: { opacity: 0.6 },
  cardContent: { gap: spacing[1] },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary, flex: 1 },
  dimText: { color: colors.text.disabled },
  notes: { fontSize: typography.fontSize.sm, color: colors.text.secondary, fontStyle: 'italic' },
  cancelledChip: { backgroundColor: '#FEE2E2' },
  cancelledChipText: { fontSize: typography.fontSize.xs, color: colors.semantic.error },
});
