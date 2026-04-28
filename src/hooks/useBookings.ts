import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as bookingsService from '@/services/bookings';
import { getBookingErrorMessage } from '@/lib/errors';

export function useUpcomingShopDaysWithBookings() {
  return useQuery({
    queryKey: queryKeys.shopDays.upcoming(),
    queryFn: async () => {
      const { data, error } = await bookingsService.getUpcomingShopDaysWithBookings();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: queryKeys.bookings.mine(),
    queryFn: async () => {
      const { data, error } = await bookingsService.getMyBookings();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useBookingsForDay(shopDayId: string) {
  return useQuery({
    queryKey: queryKeys.bookings.forDay(shopDayId),
    queryFn: async () => {
      const { data, error } = await bookingsService.getBookingsForDay(shopDayId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!shopDayId,
  });
}

export function useBookSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shopDayId: string) => bookingsService.bookSlot(shopDayId),
    onMutate: async (shopDayId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.shopDays.upcoming() });
      const previous = queryClient.getQueryData(queryKeys.shopDays.upcoming());

      queryClient.setQueryData(queryKeys.shopDays.upcoming(), (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((day) =>
          day.id === shopDayId
            ? { ...day, confirmed_count: (day.confirmed_count ?? 0) + 1, my_booking_status: 'confirmed' }
            : day,
        );
      });

      return { previous };
    },
    onError: (_err, _shopDayId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.shopDays.upcoming(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopDays.upcoming() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.mine() });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => bookingsService.cancelBooking(bookingId),
    onMutate: async (_bookingId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.shopDays.upcoming() });
      const previous = queryClient.getQueryData(queryKeys.shopDays.upcoming());

      queryClient.setQueryData(queryKeys.shopDays.upcoming(), (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((day) =>
          day.my_booking_status === 'confirmed'
            ? { ...day, confirmed_count: Math.max(0, (day.confirmed_count ?? 1) - 1), my_booking_id: null, my_booking_status: null }
            : day,
        );
      });

      return { previous };
    },
    onError: (_err, _bookingId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.shopDays.upcoming(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopDays.upcoming() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.mine() });
    },
  });
}

export { getBookingErrorMessage };
