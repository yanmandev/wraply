import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { UserRole, UserStatus } from '@shared/constants/user';
import type { Paged } from '@shared/types/api';
import { api } from './http';

/** Пользователь в разделе администрирования (группа User, только admin) */
export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  role: UserRole | null;
  status: UserStatus | null;
  created_at: number;
}

export interface UserListParams {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  per_page?: number;
}

export interface UserPayload {
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** при создании обязателен; при изменении null — пароль не меняется */
  password: string | null;
}

export const usersKeys = {
  all: ['users'] as const,
  list: (params: UserListParams) => ['users', 'list', params] as const,
};

// Пустые значения не отправляем, чтобы ==? в Xano их игнорировал
const toSearchParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>;

export const usersApi = {
  list: (params: UserListParams) =>
    api.user.get('user', { searchParams: toSearchParams(params) }).json<Paged<AdminUser>>(),

  create: (payload: UserPayload) => api.user.post('user', { json: payload }).json<AdminUser>(),

  update: (id: number, payload: UserPayload) =>
    api.user.patch(`user/${id}`, { json: payload }).json<AdminUser>(),

  remove: (id: number) => api.user.delete(`user/${id}`).json<{ success: boolean }>(),
};

export const useAdminUsers = (params: UserListParams) =>
  useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
