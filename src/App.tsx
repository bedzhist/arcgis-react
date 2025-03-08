import {
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useThemeContext } from './contexts';
import { Chatbot } from './components';

export function App() {
  const themeContext = useThemeContext();

  return (
    <CalciteShell>
      <CalciteShellPanel
        slot="panel-start"
        position="start"
        layout="vertical"
        resizable
      >
        <CalcitePanel>
          <Chatbot queryAction={async () => 'sdsd'} />
        </CalcitePanel>
      </CalciteShellPanel>
      <arcgis-map
        basemap={themeContext?.darkMode ? 'dark-gray-vector' : 'gray-vector'}
      />
    </CalciteShell>
  );
}

export default App;
