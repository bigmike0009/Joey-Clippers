import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as dayRequestsService from '@/services/dayRequests';
import { useAuth } from '@/lib/AuthContext';

export function useMyDayRequests() {
  return useQuery({
    queryKey: queryKeys.dayRequests.mine(),
    queryFn: async () => {
      const { data, error } = await dayRequestsService.getMyDayRequests();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAllDayRequests() {
  return useQuery({
    queryKey: queryKeys.dayRequests.all,
    queryFn: async () => {
      const { data, error } = await dayRequestsService.getAllDayRequests();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSubmitDayRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ date, requestedTime, notes }: { date: string; requestedTime: string; notes?: string }) =>
      dayRequestsService.submitDayRequest(user!.id, date, requestedTime, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dayRequests.all });
    },
  });
}

export function useRespondToDayRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'approved' | 'declined';
    }) => dayRequestsService.respondToDayRequest(id, user!.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dayRequests.all });
    },
  });
}

export function useApproveDayRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      slotCount,
      startTime,
    }: {
      requestId: string;
      slotCount: number;
      startTime: string;
    }) => dayRequestsService.approveDayRequest(requestId, slotCount, startTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dayRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.shopDays.upcoming() });
    },
  });
}
