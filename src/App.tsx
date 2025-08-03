import { EventHandler } from '@arcgis/lumina';
import '@arcgis/map-components/components/arcgis-map';
import { useMemo, useState } from 'react';
import { LayerList } from './components';
import { useThemeContext } from './contexts';
import { ACCIDENTAL_DEATHS_MAP_ID } from './utils';

export function App() {
  const { darkMode } = useThemeContext();

  const [view, setView] = useState<__esri.MapView | __esri.SceneView>();

  const handleArcgisViewReadyChange: EventHandler<
    HTMLArcgisMapElement['arcgisViewReadyChange']
  > = (event) => {
    const newView = event.target.view;
    setView(newView);
  };

  const basemap = useMemo(
    () => (darkMode ? 'dark-gray-vector' : 'gray-vector'),
    [darkMode]
  );

  return (
    <calcite-shell>
      <calcite-shell-panel slot="panel-start">
        <LayerList view={view} />
      </calcite-shell-panel>
      <arcgis-map
        itemId={ACCIDENTAL_DEATHS_MAP_ID}
        basemap={basemap}
        onarcgisViewReadyChange={handleArcgisViewReadyChange}
      />
    </calcite-shell>
  );
}

export default App;
