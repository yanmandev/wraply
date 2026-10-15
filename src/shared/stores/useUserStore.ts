import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Пользователь Xano (auth/me). Набор полей зависит от таблицы user в Xano */
export interface User {
  id: number;
  email: string;
  name?: string;
  created_at?: number;
}

interface UserState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
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
