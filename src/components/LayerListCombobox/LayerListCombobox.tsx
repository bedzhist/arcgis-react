import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';
import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteComboboxItemGroup
} from '@esri/calcite-components-react';
import { StyleReactProps } from '@esri/calcite-components-react/dist/react-component-lib/interfaces';
import {
  CalciteComboboxCustomEvent,
  JSX
} from '@esri/calcite-components/dist/types';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArcGISLayer } from '../../types';

export interface LayerListComboboxItem {
  id: string;
  title: string;
  layer: ArcGISLayer;
  children: __esri.Collection<LayerListComboboxItem>;
}

export type LayerListComboboxChangeItem =
  | LayerListComboboxItem
  | LayerListComboboxItem[]
  | null;

interface LayerListComboboxProps
  extends Omit<JSX.CalciteCombobox, 'children'>,
    StyleReactProps {
  view?: __esri.MapView | __esri.SceneView;
  layerTypes?: ArcGISLayer['type'][];
  onLayerListComboboxChange?: (
    item: LayerListComboboxChangeItem,
    event: CalciteComboboxCustomEvent<void>
  ) => void;
  onLayerListComboboxUpdate?: (
    itemCollection: __esri.Collection<LayerListComboboxItem>
  ) => void;
  onLayerListComboboxReady?: (layerList: LayerListViewModel) => void;
}

export const LayerListCombobox = (props: LayerListComboboxProps) => {
  const {
    view: mapView,
    layerTypes,
    onLayerListComboboxChange,
    onLayerListComboboxUpdate,
    ...restProps
  } = props;

  const layerListVM = useRef<__esri.LayerListViewModel>(
    new LayerListViewModel({
      view: mapView
    })
  );

  const [items, setItems] =
    useState<__esri.Collection<LayerListComboboxItem>>();

  const comboboxItems = useMemo(() => {
    if (!items?.length) return null;
    const renderItems = (
      itemCollection: __esri.Collection<LayerListComboboxItem>,
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
  }, [items]);

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
          onLayerListComboboxChange?.([item], event);
        } else {
          onLayerListComboboxChange?.([], event);
        }
      } else {
        onLayerListComboboxChange?.(item || null, event);
      }
    } else {
      const newItems = newValue.map((value) =>
        items.flatten((item) => item.children).find((item) => item.id === value)
      );
      onLayerListComboboxChange?.(newItems, event);
    }
  };
  const createItems = (
    operationalItems: __esri.Collection<__esri.ListItem>,
    oldItems?: __esri.Collection<LayerListComboboxItem>
  ): __esri.Collection<LayerListComboboxItem> => {
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

  useEffect(() => {
    if (!mapView) {
      return;
    }
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
          onLayerListComboboxUpdate?.(newOperationalItems);
          return newOperationalItems;
        });
      }
    );
    return () => {
      layerListVMHandle?.remove();
    };
  }, [mapView]);

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

export default LayerListCombobox;
