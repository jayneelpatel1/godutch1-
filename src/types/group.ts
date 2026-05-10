/**
 * @file Group type definitions.
 * @description Types for groups, group members, and the combined GroupWithMembers type
 *              returned by most queries. Also defines the User interface for profiles.
 */

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  group_id: string;
  user_id: string;
  joined_at: string;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  memberCount: number;
}

export interface GroupInput {
  name: string;
  memberIds: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface GroupState {
  groups: GroupWithMembers[];
  isLoading: boolean;
  error: string | null;
  setGroups: (groups: GroupWithMembers[]) => void;
  addGroup: (group: GroupWithMembers) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  removeGroup: (id: string) => void;
  addMemberToGroup: (groupId: string, userId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearGroups: () => void;
}
