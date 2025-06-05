interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly DEV?: boolean
  readonly PROD?: boolean
  readonly [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
