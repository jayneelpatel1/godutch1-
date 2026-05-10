/**
 * @file React Query provider setup.
 * @description Wraps the app with QueryClientProvider configured with:
 *              - 5 minute stale time (groups/expenses change infrequently)
 *              - 2 retries on failure
 *              - No refetch on window focus (avoids unnecessary network calls)
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
