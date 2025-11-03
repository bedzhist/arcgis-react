import { EventHandler } from '@arcgis/lumina';
import '@arcgis/map-components/components/arcgis-map';
import { useMemo, useState } from 'react';
import { useThemeContext } from './contexts';
import AlertContext, { useAlerts } from './contexts/AlertContext';
import { ACCIDENTAL_DEATHS_MAP_ID } from './utils';

export function App() {
  const { isDarkMode } = useThemeContext();

  const [alerts, alertMethods] = useAlerts();

  const [, setView] = useState<__esri.MapView | __esri.SceneView>();

  const handleArcgisViewReadyChange: EventHandler<
    HTMLArcgisMapElement['arcgisViewReadyChange']
  > = (event) => {
    const newView = event.target.view;
    setView(newView);
  };

  const basemap = useMemo(
    () => (isDarkMode ? 'dark-gray-vector' : 'gray-vector'),
    [isDarkMode]
  );

  return (
    <AlertContext value={alertMethods}>
      <calcite-shell>
        <arcgis-map
          itemId={ACCIDENTAL_DEATHS_MAP_ID}
          basemap={basemap}
          onarcgisViewReadyChange={handleArcgisViewReadyChange}
        />
        {alerts.map((alert) => (
          <calcite-alert
            key={alert.id}
            slot="alerts"
            className="[--calcite-z-index-toast:1000]"
            open
            icon={alert.icon}
            kind={alert.kind}
            label={alert.title || ''}
            oncalciteAlertClose={() => alertMethods.hideAlert(alert.id)}
          >
            <div slot="title">{alert.title}</div>
            <div slot="message">{alert.message}</div>
          </calcite-alert>
        ))}
      </calcite-shell>
    </AlertContext>
  );
}

export default App;
