import ky, { HTTPError } from 'ky';
import { toast } from 'sonner';
import { env, type ApiGroup } from '@/config/env';
import { useUserStore } from '@shared/stores/useUserStore';

/** Общие настройки: таймаут, повторы, токен, реакция на 401 */
const base = ky.create({
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

const groupClient = (group: ApiGroup) =>
  base.extend({ prefix: `${env.apiHost}/api:${env.apiGroups[group]}` });

/**
 * Клиенты по группам API Xano — у каждой группы свой base URL.
 * Пути относительно группы: api.deal.get('deal/10001KB').
 */
export const api = {
  auth: groupClient('auth'),
  deal: groupClient('deal'),
  counterparty: groupClient('counterparty'),
  contact: groupClient('contact'),
  user: groupClient('user'),
} as const satisfies Record<ApiGroup, unknown>;

/** Человекочитаемый текст ошибки (Xano возвращает { message }) */
export function getErrorMessage(error: unknown): string {
  if (error instanceof HTTPError) {
    const data = error.data as { message?: string } | string | undefined;
    if (typeof data === 'object' && data?.message) return data.message;
    return `Ошибка ${error.response.status}`;
  }
  return error instanceof Error ? error.message : 'Неизвестная ошибка';
}
