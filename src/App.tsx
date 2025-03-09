import { CalciteShell } from '@esri/calcite-components-react';
import { useThemeContext } from './contexts';

export function App() {
  const themeContext = useThemeContext();

  return (
    <CalciteShell>
      <arcgis-map
        basemap={themeContext?.darkMode ? 'dark-gray-vector' : 'gray-vector'}
      />
    </CalciteShell>
  );
}

export default App;
