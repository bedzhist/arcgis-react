import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';
import {
  CalciteComboboxCustomEvent,
  TargetedEvent
} from '@esri/calcite-components';
import { ReactCalciteCombobox } from '@esri/calcite-components/types/react';
import { useEffect, useMemo, useState } from 'react';
import { v4 } from 'uuid';
import { useValue } from '../../hooks';
import { ArcGISLayer } from '../../types';

export interface LayersComboboxItem {
  id: string;
  title: string;
  layer: ArcGISLayer;
  children: __esri.Collection<LayersComboboxItem>;
}

export type LayersComboboxChangeItem =
  | LayersComboboxItem
  | LayersComboboxItem[]
  | null;
export interface LayersComboboxProps
  extends Omit<ReactCalciteCombobox, 'children'> {
  view?: __esri.MapView | __esri.SceneView;
  layerTypes?: ArcGISLayer['type'][];
  onLayersComboboxChange?: (
    item: LayersComboboxChangeItem,
    event: CalciteComboboxCustomEvent<void>
  ) => void;
  onLayersComboboxUpdate?: (
    itemCollection: __esri.Collection<LayersComboboxItem>
  ) => void;
}

export function LayersCombobox(props: LayersComboboxProps) {
  const {
    view: mapView,
    layerTypes,
    onLayersComboboxChange,
    onLayersComboboxUpdate,
    ...restProps
  } = props;

  const layerListVM = useValue<__esri.LayerListViewModel>(
    new LayerListViewModel({
      view: mapView
    })
  );

  const [items, setItems] = useState<__esri.Collection<LayersComboboxItem>>();

  const comboboxItems = useMemo(() => {
    if (!items?.length) return null;
    const renderItems = (
      itemCollection: __esri.Collection<LayersComboboxItem>,
      level: number = 0
    ) => {
      return itemCollection.map((item) => {
        const id = item.id;
        const children = item.children;
        if (children.length > 0) {
          return (
            <calcite-combobox-item-group
              key={id}
              label={item.layer.title ?? ''}
            >
              {renderItems(children, level + 1)}
            </calcite-combobox-item-group>
          );
        }
        return (
          <calcite-combobox-item
            key={id}
            value={id}
            heading={item.layer.title ?? ''}
            selected={props.value === id}
          />
        );
      });
    };
    return renderItems(items || []);
  }, [items, props.value]);

  const handleCalciteComboboxChange = (
    event: TargetedEvent<HTMLCalciteComboboxElement, undefined>
  ) => {
    if (!items) return;
    props.oncalciteComboboxChange?.(event);
    const newValue = event.target.value;
    if (typeof newValue === 'string') {
      const item = items
        .flatten((item) => item.children)
        .find((item) => item.id === newValue);
      const selectionMode = event.target.selectionMode;
      if (selectionMode === 'multiple' || selectionMode === 'ancestors') {
        if (item) {
          onLayersComboboxChange?.([item], event);
        } else {
          onLayersComboboxChange?.([], event);
        }
      } else {
        onLayersComboboxChange?.(item || null, event);
      }
    } else {
      const newItems = newValue.reduce<LayersComboboxItem[]>((prev, curr) => {
        const item = items
          .flatten((item) => item.children)
          .find((item) => item.id === curr);
        return item ? [...prev, item] : prev;
      }, []);
      onLayersComboboxChange?.(newItems, event);
    }
  };

  useEffect(() => {
    if (!mapView) {
      return;
    }
    const createItems = (
      operationalItems: __esri.Collection<__esri.ListItem>,
      oldItems?: __esri.Collection<LayersComboboxItem>
    ): __esri.Collection<LayersComboboxItem> => {
      return operationalItems
        .filter((item) => {
          const layer = item.layer;
          if (!layer) return false;
          const type = layer.type;
          if (layerTypes) {
            return layerTypes.includes(type);
          }
          return true;
        })
        .map((item) => {
          const children = createItems(item.children, oldItems);
          const oldItem = oldItems
            ?.flatten((item) => item.children)
            .find((oldItem) => oldItem.layer === item.layer);
          const layer = item.layer;
          if (!layer) {
            throw new Error('Layer is required');
          }
          const id = oldItem?.id ?? v4();
          const title = layer.title ?? '';
          return {
            id,
            title,
            layer,
            children
          };
        });
    };
    const currLayerListVM = layerListVM.get();
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
          onLayersComboboxUpdate?.(newOperationalItems);
          return newOperationalItems;
        });
      }
    );
    return () => {
      layerListVMHandle.remove();
    };
  }, [mapView, layerTypes, onLayersComboboxUpdate, layerListVM]);
  return (
    <calcite-combobox
      {...restProps}
      oncalciteComboboxChange={handleCalciteComboboxChange}
    >
      {comboboxItems}
    </calcite-combobox>
  );
}

export default LayersCombobox;
