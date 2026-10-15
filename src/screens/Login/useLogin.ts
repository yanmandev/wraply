import { useMutation } from '@tanstack/react-query';
import { authApi, type LoginPayload } from '@shared/api/auth';
import { useUserStore } from '@shared/stores/useUserStore';

/** Вход: получаем токен, затем профиль по нему, и только потом сохраняем сессию */
export function useLogin() {
  const setSession = useUserStore((s) => s.setSession);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { authToken } = await authApi.login(payload);
      const user = await authApi.me(authToken);
      return { user, token: authToken };
    },
    onSuccess: ({ user, token }) => setSession(user, token),
    meta: { silentError: true },
  });
}
