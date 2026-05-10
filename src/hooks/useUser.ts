import { useMutation } from '@tanstack/react-query';

import { createOrUpdateUser } from '@/services/userService';
import type { AuthUser } from '@/types/auth';

/**
 * @hook useUpsertUser
 * @description Upserts a user record in Supabase (create or update by Firebase UID).
 *
 * @returns { UseMutationResult } — mutate with AuthUser
 */
export function useUpsertUser() {
  return useMutation({
    mutationFn: async (authUser: AuthUser) => {
      const result = await createOrUpdateUser(authUser);
      if (!result.success) throw new Error(result.error ?? 'Failed to save user');
      return result;
    },
  });
}
