export type AppEnv = 'loc' | 'dev';

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Wraply CRM',
  appEnv: (import.meta.env.VITE_APP_ENV ?? 'loc') as AppEnv,
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  isProdBuild: import.meta.env.PROD,
} as const;
