import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Expand from '@arcgis/core/widgets/Expand';
import LayerList from '@arcgis/core/widgets/LayerList';
import {
  CalciteAlert,
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import { AddData, Toggle3d, Toggle3dWidget } from './components';
import AlertContext from './contexts/AlertContext';
import { useAlert } from './hooks';

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);
  const toggle3dRef = useRef<HTMLCalciteSegmentedControlElement>(null);

  const [toggle3dWidgets, setToggle3dWidgets] = useState<Toggle3dWidget[]>([]);

  const [alert, alertMethods] = useAlert();

  const [view, setView] = useState<__esri.MapView | __esri.SceneView>();

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
    const layerListExpand = new Expand({
      view: mapView,
      content: layerListWidget
    });
    mapView.ui.add(layerListExpand, 'top-right');
    const toggle3dEl = toggle3dRef.current;
    if (toggle3dEl) {
      mapView.ui.add(toggle3dEl, 'bottom-right');
    }
    setToggle3dWidgets([layerListWidget, layerListExpand]);
    return () => {
      mapView.destroy();
    };
  }, []);

  return (
    <AlertContext value={alertMethods}>
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
        >
          <Toggle3d
            ref={toggle3dRef}
            view={view}
            widgets={toggle3dWidgets}
            onViewToggle={setView}
          />
        </div>
        {alert && (
          <CalciteAlert
            slot="alerts"
            key={alert.id}
            icon={alert.icon}
            kind={alert.kind}
            open
            label={alert.title}
            onCalciteAlertClose={() => alertMethods.setAlert(null)}
            autoClose={alert.autoClose}
            style={{
              '--calcite-z-index-toast': 1000
            }}
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
