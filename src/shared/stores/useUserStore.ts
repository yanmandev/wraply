import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserRole, UserStatus } from '@shared/constants/user';

/** Пользователь Xano (auth/me) */
export interface User {
  id: number;
  email: string;
  /** «Имя Фамилия» — заполняет Xano */
  name?: string;
  first_name?: string | null;
  last_name?: string | null;
  /** role/status могут отсутствовать, пока поля не добавлены в Xano */
  role?: UserRole;
  status?: UserStatus;
  created_at?: number;
}

interface UserState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  /** обновить данные пользователя (роль, имя) после auth/me, не трогая токен */
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'wraply-user',
      storage: createJSONStorage(() => localStorage),
      // v0 хранил тестового пользователя без токена — сбрасываем его
      version: 1,
      migrate: () => ({ user: null, token: null }),
    },
  ),
);

export const selectIsAuthed = (s: UserState) => Boolean(s.token && s.user);
export const selectIsAdmin = (s: UserState) => s.user?.role === 'admin';
