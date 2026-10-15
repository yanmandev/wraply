import { useEffect, type ReactNode } from 'react';
import { App as AntApp, ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import NiceModal from '@ebay/nice-modal-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { env } from '@/config/env';
import { queryClient } from '@shared/api/queryClient';
import { useUiStore } from '@shared/stores/useUiStore';
import { getAntdTheme } from '@shared/theme/antdTheme';
import '@shared/lib/date';

export function Providers({ children }: { children: ReactNode }) {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={ruRU} theme={getAntdTheme(theme)}>
        <AntApp>
          <NiceModal.Provider>{children}</NiceModal.Provider>
          <Toaster
            position="bottom-center"
            theme={theme === 'light' ? 'light' : 'dark'}
            richColors
            closeButton
          />
        </AntApp>
      </ConfigProvider>
      {env.appEnv === 'loc' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
