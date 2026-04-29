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

export function usePastShopDays() {
  return useQuery({
    queryKey: queryKeys.shopDays.past(),
    queryFn: async () => {
      const { data, error } = await shopDaysService.getPastShopDays();
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
      startTime,
      slotCount,
      notes,
    }: {
      date: string;
      startTime: string;
      slotCount: number;
      notes?: string;
    }) => shopDaysService.createShopDay(user!.id, date, startTime, slotCount, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopDays.all });
    },
  });
}

export function useUpdateShopDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, startTime, slotCount }: { id: string; startTime: string; slotCount: number }) =>
      shopDaysService.updateShopDay(id, startTime, slotCount),
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
