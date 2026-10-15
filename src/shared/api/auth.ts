import { z } from 'zod';
import { http } from './http';

export const loginSchema = z.object({
  email: z.email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export interface LoginResponse {
  authToken: string;
}

// Xano: POST /auth/login → { authToken }. Подключим на этапе авторизации.
export const authApi = {
  login: (payload: LoginPayload) =>
    http.post('auth/login', { json: payload }).json<LoginResponse>(),
};
