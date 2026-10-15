import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Аналог «shared resolution» из docs/folder-structure.md
    alias: {
      '@shared': r('./src/shared'),
      '@app': r('./src/screens/App'),
      '@': r('./src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      less: {
        // миксины и брейкпоинты доступны в каждом .less без импорта
        additionalData: `@import "@shared/styles/mixins.less";`,
      },
    },
  },
  build: {
    // основной вес — antd; экраны уже вынесены в отдельные чанки
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5173,
  },
});
