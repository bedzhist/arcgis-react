import esriConfig from '@arcgis/core/config';

const PORTAL_URL = import.meta.env.VITE_ESRI_PORTAL_URL;
if (PORTAL_URL) {
  esriConfig.portalUrl = PORTAL_URL;
}
