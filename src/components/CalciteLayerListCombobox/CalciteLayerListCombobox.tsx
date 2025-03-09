import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';
import { CalciteComboboxCustomEvent } from '@esri/calcite-components';
import {
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteComboboxItemGroup
} from '@esri/calcite-components-react';
import { EventName } from '@lit/react';
import { useEffect, useMemo, useState } from 'react';
import { v4 } from 'uuid';
import { useValue } from '../../hooks';
import { ArcGISLayer, ComponentProps } from '../../types';

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

type CalciteComboboxProps = ComponentProps<
  HTMLCalciteComboboxElement,
  {
    onCalciteComboboxBeforeClose: EventName<
      HTMLCalciteComboboxElement['calciteComboboxBeforeClose']
    >;
    onCalciteComboboxBeforeOpen: EventName<
      HTMLCalciteComboboxElement['calciteComboboxBeforeOpen']
    >;
    onCalciteComboboxChange: EventName<
      HTMLCalciteComboboxElement['calciteComboboxChange']
    >;
    onCalciteComboboxChipClose: EventName<
      HTMLCalciteComboboxElement['calciteComboboxChipClose']
    >;
    onCalciteComboboxClose: EventName<
      HTMLCalciteComboboxElement['calciteComboboxClose']
    >;
    onCalciteComboboxFilterChange: EventName<
      HTMLCalciteComboboxElement['calciteComboboxFilterChange']
    >;
    onCalciteComboboxOpen: EventName<
      HTMLCalciteComboboxElement['calciteComboboxOpen']
    >;
  }
>;

export interface CalciteLayerListComboboxProps
  extends Omit<CalciteComboboxProps, 'children'> {
  view?: __esri.MapView | __esri.SceneView;
  layerTypes?: ArcGISLayer['type'][];
  onCalciteLayerListComboboxChange?: (
    item: CalciteLayerListComboboxChangeItem,
    event: CalciteComboboxCustomEvent<void>
  ) => void;
  onCalciteLayerListComboboxUpdate?: (
    itemCollection: __esri.Collection<CalciteLayerListComboboxItem>
  ) => void;
}

export function CalciteLayerListCombobox(props: CalciteLayerListComboboxProps) {
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
              label={item.layer.title ?? ''}
            >
              {renderItems(children, level + 1)}
            </CalciteComboboxItemGroup>
          );
        }
        return (
          <CalciteComboboxItem
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
    event: CalciteComboboxCustomEvent<undefined>
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
      const newItems = newValue.reduce<CalciteLayerListComboboxItem[]>(
        (prev, curr) => {
          const item = items
            .flatten((item) => item.children)
            .find((item) => item.id === curr);
          return item ? [...prev, item] : prev;
        },
        []
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
    const currLayerListVM = layerListVM.value;
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
  }, [mapView, layerTypes, onCalciteLayerListComboboxUpdate, layerListVM]);
  return (
    <CalciteCombobox
      {...restProps}
      onCalciteComboboxChange={handleCalciteComboboxChange}
    >
      {comboboxItems}
    </CalciteCombobox>
  );
}

export default CalciteLayerListCombobox;
