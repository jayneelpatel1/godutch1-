import { useMutation } from '@tanstack/react-query';

import { createOrUpdateUser } from '@/services/userService';
import type { AuthUser } from '@/types/auth';

export function useUpsertUser() {
  return useMutation({
    mutationFn: async (authUser: AuthUser) => {
      const result = await createOrUpdateUser(authUser);
      if (!result.success) throw new Error(result.error ?? 'Failed to save user');
      return result;
    },
  });
}
