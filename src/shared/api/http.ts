import ky, { HTTPError } from 'ky';
import { toast } from 'sonner';
import { env } from '@/config/env';
import { useUserStore } from '@shared/stores/useUserStore';

/**
 * Базовый HTTP-клиент. Пути относительно VITE_API_URL: http.get('auth/me').
 */
export const http = ky.create({
  prefix: env.apiUrl,
  timeout: 30_000,
  retry: { limit: 1, methods: ['get'] },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const { token } = useUserStore.getState();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401 && useUserStore.getState().token) {
          useUserStore.getState().logout();
          toast.error('Сессия истекла, войдите снова');
        }
      },
    ],
  },
});

/** Человекочитаемый текст ошибки (Xano возвращает { message }) */
export function getErrorMessage(error: unknown): string {
  if (error instanceof HTTPError) {
    const data = error.data as { message?: string } | string | undefined;
    if (typeof data === 'object' && data?.message) return data.message;
    return `Ошибка ${error.response.status}`;
  }
  return error instanceof Error ? error.message : 'Неизвестная ошибка';
}
