import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import * as profilesService from '@/services/profiles';
import * as invitesService from '@/services/invites';

export function useAllProfiles() {
  return useQuery({
    queryKey: queryKeys.profiles.members(),
    queryFn: async () => {
      const { data, error } = await profilesService.getAllProfiles();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRevokeMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => profilesService.revokeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all });
    },
  });
}

export function useInviteList() {
  return useQuery({
    queryKey: queryKeys.invites.all,
    queryFn: async () => {
      const { data, error } = await invitesService.getInviteList();
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useGenerateInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email }: { email?: string } = {}) => invitesService.generateInvite(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.all });
    },
  });
}

export function useDeleteInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitesService.deleteInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invites.all });
    },
  });
}
