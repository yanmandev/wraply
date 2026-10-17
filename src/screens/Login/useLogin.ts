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
      // Xano уже не пускает неактивных; это подстраховка на случай старого auth/login
      if (user.status && user.status !== 'active') {
        throw new Error(
          user.status === 'archived'
            ? 'Учётная запись в архиве. Обратитесь к администратору.'
            : 'Доступ временно ограничен. Обратитесь к администратору.',
        );
      }
      return { user, token: authToken };
    },
    onSuccess: ({ user, token }) => setSession(user, token),
    meta: { silentError: true },
  });
}
