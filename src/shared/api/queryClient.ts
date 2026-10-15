import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from './http';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: false, // повторы делает ky
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  }),
});
