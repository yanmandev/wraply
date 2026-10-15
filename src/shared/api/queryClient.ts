import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from './http';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** ошибку показывает сам экран — общий тост не нужен */
      silentError?: boolean;
    };
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: false, // повторы делает ky
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (!mutation.meta?.silentError) toast.error(getErrorMessage(error));
    },
  }),
});
