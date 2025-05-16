import esriConfig from '@arcgis/core/config';
import { registerStyles, unsafeCSS } from '@vaadin/vaadin-themable-mixin';
import scrollbarStyle from '../styles/scrollbar.css?inline';

if (import.meta.env.VITE_ESRI_PORTAL_URL) {
  esriConfig.portalUrl = import.meta.env.VITE_ESRI_PORTAL_URL;
}

// Register custom scrollbar styles for the vaadin-grid component
registerStyles('vaadin-grid', unsafeCSS(scrollbarStyle));
