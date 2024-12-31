import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';
import { CalciteComboboxCustomEvent, JSX } from '@esri/calcite-components';
import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteComboboxItemGroup
} from '@esri/calcite-components-react';
import { StyleReactProps } from '@esri/calcite-components-react/dist/react-component-lib/interfaces';
import _ from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useValue } from '../../hooks';
import { ArcGISLayer } from '../../types';

export interface CalciteLayerListComboboxItem {
  id: string;
  title: string;
  layer: ArcGISLayer;
  children: __esri.Collection<CalciteLayerListComboboxItem>;
}

export type CalciteLayerListComboboxChangeItem =
  | CalciteLayerListComboboxItem
  | CalciteLayerListComboboxItem[]
  | null;

export interface CalciteLayerListComboboxProps
  extends Omit<JSX.CalciteCombobox, 'children'>,
    StyleReactProps {
  view?: __esri.MapView | __esri.SceneView;
  layerTypes?: ArcGISLayer['type'][];
  onCalciteLayerListComboboxChange?: (
    item: CalciteLayerListComboboxChangeItem,
    event: CalciteComboboxCustomEvent<void>
  ) => void;
  onCalciteLayerListComboboxUpdate?: (
    itemCollection: __esri.Collection<CalciteLayerListComboboxItem>
  ) => void;
  onCalciteLayerListComboboxReady?: (layerList: LayerListViewModel) => void;
}

export const CalciteLayerListCombobox = (
  props: CalciteLayerListComboboxProps
) => {
  const {
    view: mapView,
    layerTypes,
    onCalciteLayerListComboboxChange,
    onCalciteLayerListComboboxUpdate,
    ...restProps
  } = props;

  const layerListVM = useValue<__esri.LayerListViewModel>(
    new LayerListViewModel({
      view: mapView
    })
  );

  const [items, setItems] =
    useState<__esri.Collection<CalciteLayerListComboboxItem>>();

  const comboboxItems = useMemo(() => {
    if (!items?.length) return null;
    const renderItems = (
      itemCollection: __esri.Collection<CalciteLayerListComboboxItem>,
      level: number = 0
    ) => {
      return itemCollection.map((item) => {
        const id = item.id;
        const children = item.children;
        if (children.length > 0) {
          return (
            <CalciteComboboxItemGroup
              key={id}
              label={item.layer.title}
            >
              {renderItems(children, level + 1)}
            </CalciteComboboxItemGroup>
          );
        }
        return (
          <CalciteComboboxItem
            key={id}
            value={id}
            textLabel={item.layer.title}
            selected={props.value === id}
          />
        );
      });
    };
    return renderItems(items || []);
  }, [items, props.value]);

  const handleCalciteComboboxChange = (
    event: CalciteComboboxCustomEvent<void>
  ) => {
    if (!items) return;
    props.onCalciteComboboxChange?.(event);
    const newValue = event.target.value;
    if (typeof newValue === 'string') {
      const item = items
        .flatten((item) => item.children)
        .find((item) => item.id === newValue);
      const selectionMode = event.target.selectionMode;
      if (selectionMode === 'multiple' || selectionMode === 'ancestors') {
        if (item) {
          onCalciteLayerListComboboxChange?.([item], event);
        } else {
          onCalciteLayerListComboboxChange?.([], event);
        }
      } else {
        onCalciteLayerListComboboxChange?.(item || null, event);
      }
    } else {
      const newItems = newValue.map((value) =>
        items.flatten((item) => item.children).find((item) => item.id === value)
      );
      onCalciteLayerListComboboxChange?.(newItems, event);
    }
  };

  useEffect(() => {
    if (!mapView) {
      return;
    }
    const createItems = (
      operationalItems: __esri.Collection<__esri.ListItem>,
      oldItems?: __esri.Collection<CalciteLayerListComboboxItem>
    ): __esri.Collection<CalciteLayerListComboboxItem> => {
      return operationalItems
        .filter((item) => {
          if (layerTypes) {
            return layerTypes.includes(item.layer.type);
          }
          return true;
        })
        .map((item) => {
          const children = createItems(item.children, oldItems);
          const oldItem = oldItems
            ?.flatten((item) => item.children)
            .find((oldItem) => oldItem.layer === item.layer);
          return {
            id: oldItem?.id ?? _.uniqueId('layer-'),
            title: item.title,
            layer: item.layer,
            children
          };
        });
    };
    const currLayerListVM = layerListVM.current;
    currLayerListVM.view = mapView;
    const layerListVMHandle = reactiveUtils.watch(
      () =>
        currLayerListVM.operationalItems
          .flatten((item) => item.children)
          .filter((l) => !!l.title)
          .toArray(),
      () => {
        setItems((oldItems) => {
          const newOperationalItems = createItems(
            currLayerListVM.operationalItems,
            oldItems
          );
          onCalciteLayerListComboboxUpdate?.(newOperationalItems);
          return newOperationalItems;
        });
      }
    );
    return () => {
      layerListVMHandle.remove();
    };
  }, [mapView, layerTypes, onCalciteLayerListComboboxUpdate]);

  return (
    <CalciteCombobox
      {...restProps}
      onCalciteComboboxChange={handleCalciteComboboxChange}
    >
      {comboboxItems || (
        <div className="m-7 text-center text-1">No layers available</div>
      )}
    </CalciteCombobox>
  );
};

export default CalciteLayerListCombobox;
