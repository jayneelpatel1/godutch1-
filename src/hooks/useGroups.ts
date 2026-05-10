import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { createGroup, deleteGroup, fetchGroups, updateGroup } from '@/services/groupService';
import type { GroupInput } from '@/types/group';

/**
 * @hook useGroups
 * @description Fetches all groups the current user belongs to using React Query.
 *              Syncs results into Zustand groupStore for immediate UI updates on mutations.
 *
 * @returns { groups: GroupWithMembers[], isLoading: boolean, error: string | null, refetch: () => void }
 *
 * @dependencies useAuthStore (reads current user ID), useGroupStore (local cache)
 * @query-key ['groups', userId]
 */
export function useGroups() {
  const userId = useAuthStore((state) => state.user?.id);
  const groupsFromStore = useGroupStore((state) => state.groups);
  const setLocalGroups = useGroupStore((state) => state.setGroups);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['groups', userId],
    queryFn: async () => {
      if (!userId) {
        return { groups: [] };
      }
      const result = await fetchGroups(userId);
      if (result.groups.length > 0) {
        setLocalGroups(result.groups);
      }
      return result;
    },
    enabled: !!userId,
  });

  const groups = groupsFromStore.length > 0 ? groupsFromStore : (data?.groups ?? []);

  return {
    groups,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

/**
 * @hook useCreateGroup
 * @description Creates a new group via Supabase and syncs to local store and query cache.
 *
 * @returns { UseMutationResult } — mutate with GroupInput
 *
 * @invalidates ['groups', userId], ['activities', userId]
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user);
  const addLocalGroup = useGroupStore((state) => state.addGroup);

  return useMutation({
    mutationFn: async (groupInput: GroupInput) => {
      if (!userId) throw new Error('Not authenticated');
      const result = await createGroup(groupInput, userId.id);
      if (result.error) throw new Error(result.error);
      return result.group;
    },
    onSuccess: (group) => {
      if (group) {
        addLocalGroup(group);
      }
      queryClient.invalidateQueries({ queryKey: ['groups', userId?.id] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId?.id] });
    },
    onError: (error) => {
      console.error('[useGroups] createGroup mutation failed:', error.message);
    },
  });
}

/**
 * @hook useUpdateGroup
 * @description Updates group metadata via Supabase.
 *
 * @returns { UseMutationResult } — mutate with { groupId, updates }
 *
 * @invalidates ['groups', userId], ['activities', userId]
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async ({ groupId, updates }: { groupId: string; updates: Record<string, unknown> }) => {
      if (!userId) throw new Error('Not authenticated');
      const result = await updateGroup(groupId, updates);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', userId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
  });
}

/**
 * @hook useDeleteGroup
 * @description Deletes a group via Supabase, removes it from local store immediately,
 *              and invalidates queries.
 *
 * @returns { UseMutationResult } — mutate with { groupId, groupName? }
 *
 * @invalidates ['groups', userId], ['activities', userId]
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const removeLocalGroup = useGroupStore((state) => state.removeGroup);

  return useMutation({
    mutationFn: async ({ groupId, groupName }: { groupId: string; groupName?: string }) => {
      if (!userId) throw new Error('Not authenticated');
      const result = await deleteGroup(groupId, groupName, userId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: (_, variables) => {
      removeLocalGroup(variables.groupId);
      queryClient.invalidateQueries({ queryKey: ['groups', userId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
    onError: (error) => {
      console.error('[useDeleteGroup] Delete failed:', error);
    },
  });
}
