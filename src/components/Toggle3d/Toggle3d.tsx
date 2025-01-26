import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import {
  CalciteSegmentedControl,
  CalciteSegmentedControlItem
} from '@esri/calcite-components-react';
import { CalciteSegmentedControlCustomEvent } from '@esri/calcite-components';
import { useEffect, useState } from 'react';
import { useAlertContext } from '../../contexts/AlertContext';

type Toggle3dValue = __esri.MapView['type'] | __esri.SceneView['type'];

export type Toggle3dWidget = __esri.Expand | __esri.LayerList;

export interface Toggle3dProps {
  view?: __esri.MapView | __esri.SceneView;
  widgets: Toggle3dWidget[];
  onViewToggle: (view: __esri.MapView | __esri.SceneView) => void;
}

export function Toggle3d(props: Toggle3dProps) {
  const alertContext = useAlertContext();

  const [value, setValue] = useState<Toggle3dValue>();

  const handleChange = (event: CalciteSegmentedControlCustomEvent<void>) => {
    const view = props.view;
    if (!view) {
      return;
    }
    const viewContainer = view.container;
    if (!viewContainer) {
      return;
    }
    let newView: __esri.MapView | __esri.SceneView;
    const value = event.target.value;
    if (value === '3d') {
      newView = new SceneView({
        map: view.map,
        viewpoint: view.viewpoint,
        ui: view.ui,
        container: viewContainer
      });
    } else if (value === '2d') {
      newView = new MapView({
        map: view.map,
        viewpoint: view.viewpoint,
        ui: view.ui,
        container: viewContainer
      });
    } else {
      alertContext?.showDefaultErrorAlert();
      return;
    }
    props.widgets.forEach((widget) => (widget.view = newView));
    props.onViewToggle(newView);
  };

  useEffect(() => {
    if (!props.view) {
      return;
    }
    setValue(props.view.type);
  }, [props.view]);

  return (
    <CalciteSegmentedControl
      value={value}
      onCalciteSegmentedControlChange={handleChange}
    >
      <CalciteSegmentedControlItem value="2d">2D</CalciteSegmentedControlItem>
      <CalciteSegmentedControlItem value="3d">3D</CalciteSegmentedControlItem>
    </CalciteSegmentedControl>
  );
}

export default Toggle3d;
