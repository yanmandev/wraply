import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const THEMES = ['light', 'night', 'neon'] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_LABEL: Record<Theme, string> = {
  light: 'День',
  night: 'Ночь',
  neon: 'Неон',
};

interface UiState {
  theme: Theme;
  menuExpanded: boolean;
  /** блок «Сводка» над реестром сделок развёрнут */
  dealsStatsOpen: boolean;
  nextTheme: () => Theme;
  toggleMenu: () => void;
  toggleDealsStats: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      menuExpanded: false,
      dealsStatsOpen: true,
      nextTheme: () => {
        const theme = THEMES[(THEMES.indexOf(get().theme) + 1) % THEMES.length];
        set({ theme });
        return theme;
      },
      toggleMenu: () => set((s) => ({ menuExpanded: !s.menuExpanded })),
      toggleDealsStats: () => set((s) => ({ dealsStatsOpen: !s.dealsStatsOpen })),
    }),
    {
      // ключ читается также в index.html для применения темы до загрузки React
      name: 'wraply-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ theme, menuExpanded, dealsStatsOpen }) => ({
        theme,
        menuExpanded,
        dealsStatsOpen,
      }),
    },
  ),
);
