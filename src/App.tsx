import Collection from '@arcgis/core/core/Collection';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import EsriLayerList from '@arcgis/core/widgets/LayerList';
import {
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import LayerList from './components/LayerList';
import {
  PERMITS_LAYER_ID,
  SF_CRIMES_BY_BLOCK_GROUP_LAYER_ID,
  US_VOTING_PRECINCTS_2008_ELECTION_LAYER_ID
} from './utils';

export function App() {
  const viewRef = useRef<HTMLDivElement>(null);

  const [view, setView] = useState<__esri.MapView>();

  const listItemCreatedFunction: __esri.LayerListListItemCreatedHandler = (
    event
  ) => {
    const item = event.item as __esri.ListItem;
    item.actionsSections = new Collection([
      [
        {
          title: 'Zoom to',
          icon: 'magnifying-glass-plus',
          id: 'zoom-to'
        },
        {
          title: 'Zoom to full extent',
          icon: 'zoom-out-fixed',
          id: 'zoom-out'
        }
      ]
    ]);
  };

  useEffect(() => {
    const viewEl = viewRef.current;
    if (!viewEl) {
      return;
    }
    const crimesLayer = new FeatureLayer({
      portalItem: { id: SF_CRIMES_BY_BLOCK_GROUP_LAYER_ID }
    });
    const usVotingLayer = new FeatureLayer({
      portalItem: { id: US_VOTING_PRECINCTS_2008_ELECTION_LAYER_ID }
    });
    const permitsLayer = new MapImageLayer({
      portalItem: { id: PERMITS_LAYER_ID }
    });
    const map = new Map({
      basemap: 'dark-gray-vector',
      layers: [crimesLayer, usVotingLayer, permitsLayer]
    });
    const mapView = new MapView({
      map,
      container: viewEl
    });
    setView(mapView);
    const layerListWidget = new EsriLayerList({
      view: mapView,
      minFilterItems: 1,
      visibilityAppearance: 'checkbox',
      visibleElements: {
        filter: true
      },
      listItemCreatedFunction: (event) => {
        const item = event.item as __esri.ListItem;
        item.actionsSections = new Collection([
          [
            {
              title: 'Zoom to',
              className: 'esri-icon-zoom-in-magnifying-glass',
              id: 'zoom-to'
            },
            {
              title: 'Zoom to full extent',
              className: 'esri-icon-zoom-out-fixed',
              id: 'zoom-out'
            }
          ],
          [
            {
              title: 'Edit',
              className: 'esri-icon-pencil',
              id: 'edit'
            },
            {
              title: 'Delete',
              className: 'esri-icon-trash',
              id: 'delete'
            }
          ]
        ]);
      }
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
          <LayerList
            view={view}
            listItemCreatedFunction={listItemCreatedFunction}
          />
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
