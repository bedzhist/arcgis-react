import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@esri/calcite-components/dist/calcite/assets',
          dest: '.'
        },
        {
          src: 'node_modules/@arcgis/core/assets/esri/themes',
          dest: '.'
        }
      ]
    })
  ]
});
