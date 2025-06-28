import { EventHandler } from '@arcgis/lumina';
import { useMemo, useState } from 'react';
import { useThemeContext } from './contexts';
import { ACCIDENTAL_DEATHS_MAP_ID } from './utils';

export function App() {
  const { darkMode } = useThemeContext();

  const [, setView] = useState<__esri.MapView | __esri.SceneView>();

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
      <arcgis-map
        itemId={ACCIDENTAL_DEATHS_MAP_ID}
        basemap={basemap}
        onarcgisViewReadyChange={handleArcgisViewReadyChange}
      />
    </calcite-shell>
  );
}

export default App;
