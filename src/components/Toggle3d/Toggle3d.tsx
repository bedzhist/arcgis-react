import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import {
  CalciteSegmentedControl,
  CalciteSegmentedControlItem
} from '@esri/calcite-components-react';
import { CalciteSegmentedControlCustomEvent } from '@esri/calcite-components';
import { useEffect, useState } from 'react';
import { useAlertContext } from '../../contexts/AlertContext';

enum Toggle3dValue {
  '2D' = '2d',
  '3D' = '3d'
}

export type Toggle3dWidget = __esri.Expand | __esri.LayerList;

export interface Toggle3dProps {
  ref?: React.Ref<HTMLCalciteSegmentedControlElement>;
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
      alertContext?.showDefaultErrorAlert();
      console.error('View is not defined');
      return;
    }
    const viewContainer = view.container;
    if (!viewContainer) {
      alertContext?.showDefaultErrorAlert();
      console.error('View container is not defined');
      return;
    }
    let newView: __esri.MapView | __esri.SceneView;
    const value = event.target.value;
    const viewProps = {
      map: view.map,
      viewpoint: view.viewpoint,
      ui: view.ui,
      container: viewContainer
    };
    if (value === Toggle3dValue['3D']) {
      newView = new SceneView(viewProps);
    } else if (value === Toggle3dValue['2D']) {
      newView = new MapView(viewProps);
    } else {
      alertContext?.showDefaultErrorAlert();
      console.error('Invalid view type');
      return;
    }
    props.widgets.forEach((widget) => (widget.view = newView));
    props.onViewToggle(newView);
  };

  useEffect(() => {
    if (!props.view) {
      return;
    }
    if (props.view.type === '2d') {
      setValue(Toggle3dValue['2D']);
    } else if (props.view.type === '3d') {
      setValue(Toggle3dValue['3D']);
    } else {
      alertContext?.showDefaultErrorAlert();
      console.error('Invalid view type');
    }
  }, [props.view]);

  return (
    <CalciteSegmentedControl
      onCalciteSegmentedControlChange={handleChange}
      ref={props.ref}
    >
      <CalciteSegmentedControlItem
        value={Toggle3dValue['2D']}
        checked={value === Toggle3dValue['2D']}
      >
        2D
      </CalciteSegmentedControlItem>
      <CalciteSegmentedControlItem
        value={Toggle3dValue['3D']}
        checked={value === Toggle3dValue['3D']}
      >
        3D
      </CalciteSegmentedControlItem>
    </CalciteSegmentedControl>
  );
}

export default Toggle3d;
