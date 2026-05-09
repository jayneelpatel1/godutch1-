import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { createGroup, deleteGroup, fetchGroups, updateGroup } from '@/services/groupService';
import type { GroupInput } from '@/types/group';

export function useGroups() {
  const userId = useAuthStore((state) => state.user?.id);
  const groupsFromStore = useGroupStore((state) => state.groups);
  const setLocalGroups = useGroupStore((state) => state.setGroups);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['groups', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('[useGroups] No userId, returning empty');
        return { groups: [] };
      }
      console.log('[useGroups] Fetching groups for userId:', userId);
      const result = await fetchGroups(userId);
      console.log('[useGroups] Fetch result:', { groupCount: result.groups.length, error: result.error });
      if (result.groups.length > 0) {
        setLocalGroups(result.groups);
      }
      return result;
    },
    enabled: !!userId,
  });

  // Return groups from store (which gets updated immediately on delete)
  // Fall back to query data if store is empty (initial load)
  const groups = groupsFromStore.length > 0 ? groupsFromStore : (data?.groups ?? []);

  return {
    groups,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user);
  const addLocalGroup = useGroupStore((state) => state.addGroup);

  return useMutation({
    mutationFn: async (groupInput: GroupInput) => {
      if (!userId) throw new Error('Not authenticated');

      // Online-only mode: Skip local SQLite save
      // Offline sync will be implemented in later phase

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
      // Update local store immediately
      removeLocalGroup(variables.groupId);
      // Invalidate queries to refetch from server
      queryClient.invalidateQueries({ queryKey: ['groups', userId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
    onError: (error) => {
      console.error('[useDeleteGroup] Delete failed:', error);
    },
  });
}
