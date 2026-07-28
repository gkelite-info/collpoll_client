'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 minute
            gcTime: 5 * 60_000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    const channel = new BroadcastChannel('app-react-query-sync');
    channel.onmessage = (event) => {
      if (event.data?.type === 'INVALIDATE_QUERY' && event.data.queryKey) {
        queryClient.invalidateQueries({ queryKey: event.data.queryKey });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools automatically hides in production, but adding the check is extra safe */}
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
