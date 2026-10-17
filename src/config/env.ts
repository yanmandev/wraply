export type AppEnv = 'loc' | 'dev';

const e = import.meta.env;

export const env = {
  appName: e.VITE_APP_NAME ?? 'Wraply CRM',
  appEnv: (e.VITE_APP_ENV ?? 'loc') as AppEnv,
  apiHost: e.VITE_API_HOST ?? '',
  /** canonical групп API Xano: base URL группы = `${apiHost}/api:${canonical}` */
  apiGroups: {
    auth: e.VITE_API_GROUP_AUTH ?? '',
    deal: e.VITE_API_GROUP_DEAL ?? '',
    counterparty: e.VITE_API_GROUP_COUNTERPARTY ?? '',
    contact: e.VITE_API_GROUP_CONTACT ?? '',
    user: e.VITE_API_GROUP_USER ?? '',
  },
  isProdBuild: e.PROD,
} as const;

export type ApiGroup = keyof typeof env.apiGroups;
