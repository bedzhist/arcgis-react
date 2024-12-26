import esriConfig from "@arcgis/core/config";
import { css, registerStyles } from "@vaadin/vaadin-themable-mixin";

if (import.meta.env.VITE_ESRI_PORTAL_URL) {
  esriConfig.portalUrl = import.meta.env.VITE_ESRI_PORTAL_URL;
}

// Register custom scrollbar styles for the vaadin-grid component
registerStyles(
  "vaadin-grid",
  css`
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background: rgb(227, 227, 227);
    }

    .calcite-mode-dark ::-webkit-scrollbar-track,
    .calcite-mode-dark ::-webkit-scrollbar-corner {
      background: rgb(24, 24, 24);
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgb(130, 130, 130);
    }

    .calcite-mode-dark ::-webkit-scrollbar-thumb:hover {
      background: rgb(227, 227, 227);
    }

    ::-webkit-scrollbar-thumb {
      background: rgb(168, 168, 168);
    }

    .calcite-mode-dark ::-webkit-scrollbar-thumb {
      background: rgb(118, 118, 118);
    }
  `
);
