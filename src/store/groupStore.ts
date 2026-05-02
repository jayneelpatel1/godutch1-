import { create } from 'zustand';

import type { GroupState, GroupWithMembers } from '@/types/group';

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  isLoading: false,
  error: null,
  setGroups: (groups: GroupWithMembers[]) => set({ groups }),
  addGroup: (group: GroupWithMembers) =>
    set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (id: string, updates: Partial<GroupWithMembers>) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  removeGroup: (id: string) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  clearGroups: () => set({ groups: [], error: null }),
}));
