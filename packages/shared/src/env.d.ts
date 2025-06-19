/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_DEV_JWT_TOKEN?: string;
  // otras variables personalizadas aquí
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
