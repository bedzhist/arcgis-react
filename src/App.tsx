import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import { useEffect, useRef } from "react";

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewEl = viewRef.current;
    if (!viewEl) {
      return;
    }
    const map = new Map({
      basemap: "dark-gray-vector",
    });
    new MapView({
      container: viewEl,
      map,
    });
  }, []);

  return <div ref={viewRef} className="h-100 bg-1" />;
}

export default App;
