import MapView from '@arcgis/core/views/MapView';
import SceneView from '@arcgis/core/views/SceneView';
import { useEffect, useState } from 'react';
import { useAlertContext } from '../../contexts/AlertContext';
import { TargetedEvent } from '@esri/calcite-components';

enum Toggle3dValue {
  '2D' = '2d',
  '3D' = '3d'
}

export type Toggle3dWidget = __esri.Expand | __esri.LayerList;

export interface Toggle3dProps {
  ref?: React.Ref<HTMLCalciteSegmentedControlElement>;
  view?: __esri.MapView | __esri.SceneView;
  widgets?: Toggle3dWidget[];
  onViewToggle?: (view: __esri.MapView | __esri.SceneView) => void;
}

export function Toggle3d(props: Toggle3dProps) {
  const alertContext = useAlertContext();

  const [value, setValue] = useState<Toggle3dValue>();

  const handleChange = (
    event: TargetedEvent<HTMLCalciteSegmentedControlElement, undefined>
  ) => {
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
    const value = (event.target as HTMLCalciteSegmentedControlElement).value;
    const viewProps = {
      map: view.map,
      viewpoint: view.viewpoint,
      ui: view.ui,
      container: viewContainer,
      popup: view.popup
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
    if (view.popup) {
      view.popup.view = newView;
    }
    props.widgets?.forEach((widget) => (widget.view = newView));
    props.onViewToggle?.(newView);
  };

  useEffect(() => {
    const view = props.view;
    if (!view) {
      return;
    }
    if (view.type === '2d') {
      setValue(Toggle3dValue['2D']);
    } else if (view.type === '3d') {
      setValue(Toggle3dValue['3D']);
    } else {
      alertContext?.showDefaultErrorAlert();
      console.error('Invalid view type');
    }
  }, [props.view]);

  return (
    <calcite-segmented-control
      oncalciteSegmentedControlChange={handleChange}
      ref={props.ref}
    >
      <calcite-segmented-control-item
        value={Toggle3dValue['2D']}
        checked={value === Toggle3dValue['2D']}
      >
        2D
      </calcite-segmented-control-item>
      <calcite-segmented-control-item
        value={Toggle3dValue['3D']}
        checked={value === Toggle3dValue['3D']}
      >
        3D
      </calcite-segmented-control-item>
    </calcite-segmented-control>
  );
}

export default Toggle3d;
