import { theme as antdTheme, type ThemeConfig } from 'antd';
import type { Theme } from '@shared/stores/useUiStore';

// Значения продублированы из themes.less: AntD вычисляет производные цвета
// из конкретных значений, CSS-переменные ему не подходят.
const palette: Record<
  Theme,
  { primary: string; bg: string; surface: string; text: string; border: string }
> = {
  light: {
    primary: '#2456E6',
    bg: '#EDF1F6',
    surface: '#FFFFFF',
    text: '#17212E',
    border: '#E3E8EF',
  },
  night: {
    primary: '#5CA8FF',
    bg: '#10161F',
    surface: '#18202C',
    text: '#E7EDF5',
    border: '#26303F',
  },
  neon: {
    primary: '#00E5FF',
    bg: '#0A0D16',
    surface: '#111624',
    text: '#EAF6FF',
    border: '#1E2A44',
  },
};

export function getAntdTheme(theme: Theme): ThemeConfig {
  const p = palette[theme];
  return {
    algorithm: theme === 'light' ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,
    cssVar: { key: 'wraply' },
    token: {
      colorPrimary: p.primary,
      colorBgLayout: p.bg,
      colorBgContainer: p.surface,
      colorBgElevated: p.surface,
      colorText: p.text,
      colorBorder: p.border,
      colorBorderSecondary: p.border,
      colorSuccess: theme === 'light' ? '#1E9E6A' : theme === 'night' ? '#4ADE80' : '#39FF88',
      colorWarning: theme === 'light' ? '#B97A10' : theme === 'night' ? '#FBBF24' : '#FFD166',
      colorError: '#D64545',
      fontFamily: '-apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      fontSize: 13,
      borderRadius: 8,
      controlHeight: 32,
    },
    components: {
      Button: {
        fontWeight: 600,
        primaryShadow: 'none',
        defaultShadow: 'none',
        ...(theme === 'neon' ? { primaryColor: '#04121A' } : {}),
      },
    },
  };
}
