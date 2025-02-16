import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import {
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useEffect, useRef } from 'react';
import Chat from './components/Chat';

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  const chatQueryAction = async (query: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `You said: ${query}`;
  };

  useEffect(() => {
    const vielEl = viewRef.current;
    if (!vielEl) {
      return;
    }
    const map = new Map({
      basemap: 'dark-gray-vector'
    });
    const mapView = new MapView({
      container: vielEl,
      map
    });
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
        <Chat queryAction={chatQueryAction} />
      </CalciteShellPanel>
      <div
        ref={viewRef}
        className="h-100"
      />
    </CalciteShell>
  );
}

export default App;
