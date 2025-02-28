import Map from '@arcgis/core/Map';
import { CalciteShell } from '@esri/calcite-components-react';
import { useValue } from './hooks';

export function App() {
  const map = useValue(
    new Map({
      basemap: 'dark-gray-vector'
    })
  );

  return (
    <CalciteShell>
      <arcgis-map map={map.value}>
        <arcgis-layer-list position="top-right" />
      </arcgis-map>
    </CalciteShell>
  );
}

export default App;
