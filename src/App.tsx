import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { CalciteShell } from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  const [, setView] = useState<__esri.MapView>();

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
      <div
        ref={viewRef}
        className="h-100"
      />
    </CalciteShell>
  );
}

export default App;
