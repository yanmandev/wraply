/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_ENV?: 'loc' | 'dev';
  readonly VITE_API_HOST?: string;
  readonly VITE_API_GROUP_AUTH?: string;
  readonly VITE_API_GROUP_DEAL?: string;
  readonly VITE_API_GROUP_COUNTERPARTY?: string;
  readonly VITE_API_GROUP_CONTACT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
