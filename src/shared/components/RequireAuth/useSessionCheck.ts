import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { toast } from 'sonner';
import { authApi } from '@shared/api/auth';
import { getErrorMessage } from '@shared/api/http';
import { useUserStore } from '@shared/stores/useUserStore';

const RECHECK_MS = 5 * 60_000;

/**
 * Перепроверяет сессию через auth/me: при открытии, при возврате на вкладку и раз в 5 минут.
 * Ограниченного или архивного пользователя (Xano отвечает 403) выводит из системы, не дожидаясь
 * конца токена. Заодно обновляет роль и имя в store — их мог поменять администратор.
 */
export function useSessionCheck() {
  const queryClient = useQueryClient();
  const token = useUserStore((s) => s.token);
  const setUser = useUserStore((s) => s.setUser);
  const logout = useUserStore((s) => s.logout);

  const me = useQuery({
    queryKey: ['auth', 'me', token],
    queryFn: () => authApi.me(token!),
    enabled: !!token,
    staleTime: 60_000,
    refetchInterval: RECHECK_MS,
    refetchOnWindowFocus: true,
    retry: false,
  });

  useEffect(() => {
    if (!me.data) return;
    // Подстраховка, если auth/me в Xano ещё старый и не проверяет статус сам
    if (me.data.status && me.data.status !== 'active') {
      logout();
      queryClient.clear();
      toast.error('Доступ к системе ограничен');
      return;
    }
    setUser(me.data);
  }, [me.data, logout, setUser, queryClient]);

  useEffect(() => {
    // 401 обрабатывает http-клиент; здесь — 403 от проверки статуса
    if (me.error instanceof HTTPError && me.error.response.status === 403) {
      logout();
      queryClient.clear();
      toast.error(getErrorMessage(me.error));
    }
  }, [me.error, logout, queryClient]);
}
