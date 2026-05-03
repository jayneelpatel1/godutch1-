import { create } from 'zustand';

import type { Group, GroupState, GroupWithMembers } from '@/types/group';

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  isLoading: false,
  error: null,
  setGroups: (groups: GroupWithMembers[]) => set({ groups }),
  addGroup: (group: GroupWithMembers) =>
    set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (id: string, updates: Partial<Group>) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  removeGroup: (id: string) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),
  addMemberToGroup: (groupId: string, userId: string) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: [
                ...g.members,
                { group_id: groupId, user_id: userId, joined_at: new Date().toISOString() },
              ],
              memberCount: g.memberCount + 1,
            }
          : g
      ),
    })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearGroups: () => set({ groups: [], error: null }),
}));
