import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import LayerList from '@arcgis/core/widgets/LayerList';
import {
  CalciteAlert,
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import AddData from './components/AddData';
import AlertContext, { Alert } from './contexts/AlertContext';

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<__esri.MapView>();
  const [alert, setAlert] = useState<Alert | null>(null);

  const setErrorAlert = (errorAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...errorAlert, kind: 'danger' });
  const setSuccessAlert = (successAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...successAlert, kind: 'success' });
  const setInfoAlert = (infoAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...infoAlert, kind: 'info' });
  const setWarningAlert = (warningAlert: Omit<Alert, 'kind'>) =>
    setAlert({ ...warningAlert, kind: 'warning' });
  const showDefaultErrorAlert = () =>
    setAlert({
      title: 'Error',
      message:
        'An error occurred. Please contact support if the problem persists.',
      icon: 'exclamation-mark-triangle',
      kind: 'danger'
    });

  useEffect(() => {
    const viewEl = viewRef.current;
    if (!viewEl) {
      return;
    }
    const map = new Map({
      basemap: 'dark-gray-vector'
    });
    const mapView = new MapView({
      map,
      container: viewEl
    });
    setView(mapView);
    const layerListWidget = new LayerList({
      view: mapView
    });
    mapView.ui.add(layerListWidget, 'top-right');
    return () => {
      mapView.destroy();
    };
  }, []);

  return (
    <AlertContext
      value={{
        showAlert: setAlert,
        showErrorAlert: setErrorAlert,
        showSuccessAlert: setSuccessAlert,
        showInfoAlert: setInfoAlert,
        showWarningAlert: setWarningAlert,
        showDefaultErrorAlert
      }}
    >
      <CalciteShell>
        <CalciteShellPanel
          slot="panel-start"
          position="start"
          layout="vertical"
          resizable
          style={{
            '--calcite-shell-panel-width': '400px',
            '--calcite-shell-panel-max-width': '600px'
          }}
        >
          <CalcitePanel>
            <AddData view={view} />
          </CalcitePanel>
        </CalciteShellPanel>
        <div
          ref={viewRef}
          className="h-100"
        />
        {alert && (
          <CalciteAlert
            slot="alerts"
            icon={alert.icon}
            kind={alert.kind}
            open
            label={alert.title}
            onCalciteAlertClose={() => setAlert(null)}
            autoClose={alert.autoClose}
          >
            <div slot="title">{alert.title}</div>
            <div slot="message">{alert.message}</div>
          </CalciteAlert>
        )}
      </CalciteShell>
    </AlertContext>
  );
}

export default App;
