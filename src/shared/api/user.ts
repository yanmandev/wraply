import { useQuery } from '@tanstack/react-query';
import type { UserRole } from '@shared/constants/user';
import type { UserBrief } from '@shared/types/deal';
import { api } from './http';

export const userKeys = {
  list: (role?: UserRole) => ['user', 'list', role ?? 'all'] as const,
};

export const userApi = {
  /** GET /user?role= (группа Authentication) */
  list: (role?: UserRole) =>
    api.auth.get('user', { searchParams: role ? { role } : {} }).json<UserBrief[]>(),
};

/** Сотрудники для выбора МОП/МОС. Список меняется редко — кэшируем надолго */
export const useUsers = (role?: UserRole) =>
  useQuery({
    queryKey: userKeys.list(role),
    queryFn: () => userApi.list(role),
    staleTime: 5 * 60_000,
    // неожиданный ответ (не массив) не должен ронять страницу со списками МОП/МОС
    select: (data) => (Array.isArray(data) ? data : []),
  });
