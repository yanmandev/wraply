import { z } from 'zod';
import type { User } from '@shared/stores/useUserStore';
import { api } from './http';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Введите email').pipe(z.email('Некорректный email')),
  password: z.string().min(1, 'Введите пароль'),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export interface LoginResponse {
  authToken: string;
  user_id: number;
}

export const authApi = {
  /** POST /auth/login → { authToken, user_id } */
  login: (payload: LoginPayload) =>
    api.auth.post('auth/login', { json: payload }).json<LoginResponse>(),

  /** GET /auth/me → текущий пользователь. Токен передаём явно: в store его ещё нет */
  me: (token: string) =>
    api.auth.get('auth/me', { headers: { Authorization: `Bearer ${token}` } }).json<User>(),
};
