import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  setSession: (user: User, token: string) => void;
  logout: () => void;
}

// Временный пользователь до подключения авторизации через Xano (auth/login)
export const TEST_USER: User = {
  id: 1,
  name: 'Мытник Антон',
  email: 'test@wraply.local',
  role: 'МОП',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: TEST_USER,
      token: null,
      setSession: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'wraply-user',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
