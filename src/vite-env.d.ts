/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_ESRI_PORTAL_URL: string
  readonly VITE_ESRI_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}