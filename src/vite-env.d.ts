/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEET_ID?: string;
  readonly VITE_LEADS_GID?: string;
  readonly VITE_CAMPAIGNS_GID?: string;
  readonly VITE_WEEKLY_REVIEWS_GID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
