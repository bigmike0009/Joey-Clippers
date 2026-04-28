import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as shopDaysService from '@/services/shopDays';
import { useAuth } from '@/lib/AuthContext';

export function useUpcomingShopDays() {
  return useQuery({
    queryKey: queryKeys.shopDays.upcoming(),
    queryFn: async () => {
      const { data, error } = await shopDaysService.getUpcomingShopDays();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateShopDay() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      date,
      slotCount,
      notes,
    }: {
      date: string;
      slotCount: number;
      notes?: string;
    }) => shopDaysService.createShopDay(user!.id, date, slotCount, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopDays.all });
    },
  });
}

export function useUpdateShopDaySlots() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, slotCount }: { id: string; slotCount: number }) =>
      shopDaysService.updateShopDaySlots(id, slotCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopDays.all });
    },
  });
}

export function useCancelShopDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => shopDaysService.cancelShopDay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopDays.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
  });
}
