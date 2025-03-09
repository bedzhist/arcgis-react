import {
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
        layout="vertical"
        resizable
      >
        <Chatbot
          queryAction={async (query: string) => {
            // Simulate a query action
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(`Response to: ${query}`);
              }, 1000);
            });
          }}
        />
      </CalciteShellPanel>
      <arcgis-map
        basemap={themeContext?.darkMode ? 'dark-gray-vector' : 'gray-vector'}
      />
    </CalciteShell>
  );
}

export default App;
