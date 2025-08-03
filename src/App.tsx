import { EventHandler } from '@arcgis/lumina';
import '@arcgis/map-components/components/arcgis-map';
import { useMemo, useState } from 'react';
import { useThemeContext } from './contexts';
import AlertContext, { useAlert } from './contexts/AlertContext';
import { ACCIDENTAL_DEATHS_MAP_ID } from './utils';

export function App() {
  const { darkMode } = useThemeContext();

  const [alert, alertMethods] = useAlert();

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
    <AlertContext value={alertMethods}>
      <calcite-shell>
        <arcgis-map
          itemId={ACCIDENTAL_DEATHS_MAP_ID}
          basemap={basemap}
          onarcgisViewReadyChange={handleArcgisViewReadyChange}
        />
        <calcite-alert
          slot="alerts"
          icon={alert?.icon}
          kind={alert?.kind}
          open={!!alert}
          label={alert?.title || ''}
          oncalciteAlertClose={alertMethods.hideAlert}
        >
          <div slot="title">{alert?.title}</div>
          <div slot="message">{alert?.message}</div>
        </calcite-alert>
      </calcite-shell>
    </AlertContext>
  );
}

export default App;
