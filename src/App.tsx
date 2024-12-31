import Collection from '@arcgis/core/core/Collection';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import EsriLayerList from '@arcgis/core/widgets/LayerList';
import Slider from '@arcgis/core/widgets/Slider';
import {
  CalcitePanel,
  CalciteShell,
  CalciteShellPanel
} from '@esri/calcite-components-react';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
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
        }
      ],
      [
        {
          title: 'Zoom out',
          icon: 'magnifying-glass-minus',
          id: 'zoom-out'
        },
        {
          title: 'Zoom in',
          icon: 'magnifying-glass-plus',
          id: 'zoom-in'
        }
      ]
    ]);
    const panelDiv = document.createElement('div');
    const panelRoot = ReactDOM.createRoot(panelDiv);
    panelRoot.render(
      <>
        <h1>Panel content</h1>
      </>
    );
    const slider = new Slider({
      min: 0,
      max: 1,
      precision: 2,
      values: [1],
      visibleElements: {
        labels: true,
        rangeLabels: true
      }
    });
    const panel: __esri.ListItemPanelProperties = {
      content: slider,
      icon: 'sliders-horizontal',
      title: 'Panel title'
    };
    item.set('panel', panel);
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
            }
          ]
        ]);
        const slider = new Slider({
          min: 0,
          max: 1,
          precision: 2,
          values: [1],
          visibleElements: {
            labels: true,
            rangeLabels: true
          }
        });
        const panel: __esri.ListItemPanelProperties = {
          content: slider,
          icon: 'sliders-horizontal',
          title: 'Change layer opacity'
        };
        item.set('panel', panel);
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
