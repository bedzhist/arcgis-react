import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import {
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import AddData from './components/AddData';
import LayerList from '@arcgis/core/widgets/LayerList';

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<__esri.MapView>();

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
      container: viewEl,
      popup: {
        defaultPopupTemplateEnabled: true
      }
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
    <CalciteShell>
      <CalciteShellPanel
        slot="panel-start"
        position="start"
        layout="vertical"
        resizable
      >
        <CalcitePanel>
          <AddData view={view} />
        </CalcitePanel>
      </CalciteShellPanel>
      <div
        ref={viewRef}
        className="h-100"
      />
    </CalciteShell>
  );
}

export default App;
