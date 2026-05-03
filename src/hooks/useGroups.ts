import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/store/authStore';
import { useGroupStore } from '@/store/groupStore';
import { createGroup, deleteGroup, fetchGroups, updateGroup } from '@/services/groupService';
import { createOrUpdateUser } from '@/services/userService';
import type { GroupInput } from '@/types/group';

export function useGroups() {
  const userId = useAuthStore((state) => state.user?.id);
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

  return {
    groups: data?.groups ?? [],
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

      const userResult = await createOrUpdateUser(userId);
      if (!userResult.success) {
        throw new Error(userResult.error ?? 'Failed to save user details');
      }

      const result = await createGroup(groupInput, userId.id);
      if (result.error) throw new Error(result.error);
      return result.group;
    },
    onSuccess: (group) => {
      if (group) {
        addLocalGroup(group);
      }
      queryClient.invalidateQueries({ queryKey: ['groups', userId?.id] });
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
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!userId) throw new Error('Not authenticated');
      const result = await deleteGroup(groupId);
      if (result.error) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', userId] });
    },
  });
}
