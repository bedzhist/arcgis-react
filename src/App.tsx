import { EventHandler } from '@arcgis/lumina';
import { useState } from 'react';
import { FilterPanel } from './components';
import { useThemeContext } from './contexts';
import { ACCIDENTAL_DEATHS_MAP_ID } from './utils';

export function App() {
  const themeContext = useThemeContext();

  const [view, setView] = useState<__esri.MapView | __esri.SceneView>();

  const handleArcgisViewReadyChange: EventHandler<
    HTMLArcgisMapElement['arcgisViewReadyChange']
  > = (event) => {
    setView(event.target.view);
  };

  return (
    <calcite-shell>
      <calcite-shell-panel
        slot="panel-start"
        position="start"
        layout="vertical"
      >
        <FilterPanel view={view} />
      </calcite-shell-panel>
      <arcgis-map
        itemId={ACCIDENTAL_DEATHS_MAP_ID}
        basemap={themeContext?.darkMode ? 'dark-gray-vector' : 'gray-vector'}
        onarcgisViewReadyChange={handleArcgisViewReadyChange}
      />
    </calcite-shell>
  );
}

export default App;
