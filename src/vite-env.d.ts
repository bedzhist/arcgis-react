/// <reference types="vite/client" />
/// <reference types="@arcgis/map-components/types/react" />
/// <reference types="@esri/calcite-components/types/react" />

interface ImportMetaEnv {
  readonly VITE_ESRI_PORTAL_URL: string;
  readonly VITE_ESRI_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
