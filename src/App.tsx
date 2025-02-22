import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import {
  CalciteButton,
  CalciteLabel,
  CalciteShell,
  CalciteShellPanel,
  CalciteTextArea
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import { US_VOTING_PRECINCTS_2008_ELECTION_LAYER_ID } from './utils';

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  const [, setView] = useState<MapView>();

  useEffect(() => {
    const vielEl = viewRef.current;
    if (!vielEl) {
      return;
    }
    const layer = new FeatureLayer({
      portalItem: { id: US_VOTING_PRECINCTS_2008_ELECTION_LAYER_ID }
    });
    const map = new Map({
      basemap: 'dark-gray-vector',
      layers: [layer]
    });
    const mapView = new MapView({
      container: vielEl,
      map
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
        <form className="p-5">
          <CalciteLabel className="relative pb-10 rounded-round border-1 border-color-1 bg-1">
            <CalciteTextArea
              resize="none"
              rows={2}
              style={{
                '--calcite-border-width-sm': 0,
                '--calcite-text-area-background-color': 'transparent',
                '--calcite-ui-focus-color': 'transparent'
              }}
            />
            <CalciteButton
              iconStart="send"
              round
              appearance="transparent"
              className="absolute bottom-0 right-0 mb-3 mr-3"
              style={{
                textWrap: 'pretty'
              }}
            />
          </CalciteLabel>
        </form>
      </CalciteShellPanel>
      <div
        ref={viewRef}
        className="h-100"
      />
    </CalciteShell>
  );
}

export default App;
