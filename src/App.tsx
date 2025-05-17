import { EventHandler } from '@arcgis/lumina';
import { useState } from 'react';
import { useThemeContext } from './contexts';
import { ACCIDENTAL_DEATHS_MAP_ID } from './utils';

export function App() {
  const themeContext = useThemeContext();

  const [, setView] = useState<__esri.MapView | __esri.SceneView>();

  const handleArcgisViewReadyChange: EventHandler<
    HTMLArcgisMapElement['arcgisViewReadyChange']
  > = (event) => {
    setView(event.target.view);
  };

  return (
    <calcite-shell>
      <arcgis-map
        itemId={ACCIDENTAL_DEATHS_MAP_ID}
        basemap={themeContext?.darkMode ? 'dark-gray-vector' : 'gray-vector'}
        onarcgisViewReadyChange={handleArcgisViewReadyChange}
      />
    </calcite-shell>
  );
}

export default App;
