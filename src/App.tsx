import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import {
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import AddData from './components/AddData';

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
      container: viewEl
    });
    setView(mapView);
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
