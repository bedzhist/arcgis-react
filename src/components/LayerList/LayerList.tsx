import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';
import { CalciteList, CalciteNotice } from '@esri/calcite-components-react';
import { useEffect, useState } from 'react';
import { useValue } from '../../hooks';
import LayerListItem from '../LayerListItem';

export interface LayerListProps {
  ref?: React.RefObject<HTMLDivElement>;
  view?: __esri.MapView;
  listItemCreatedFunction?: __esri.LayerListListItemCreatedHandler;
}

export const LayerList = (props: LayerListProps) => {
  const layerListVM = useValue<__esri.LayerListViewModel | null>(null);

  const [operationalItems, setOperationalItems] =
    useState<__esri.Collection<__esri.ListItem>>();

  const handleItemVisibilityClick = async (
    event: React.MouseEvent<HTMLCalciteActionElement, MouseEvent>,
    value: boolean,
    item: __esri.ListItem
  ) => {
    const parent = item.parent;
    const shiftKey = event.shiftKey;
    if (shiftKey) {
      if (parent) {
        parent.children.forEach((child) => {
          if (child.hidden) return;
          child.visible = value;
        });
      } else {
        operationalItems?.forEach((operationalItem) => {
          if (operationalItem.hidden) return;
          operationalItem.visible = value;
        });
      }
    }
  };
  const renderItems = (items: __esri.Collection<__esri.ListItem>) => {
    if (!operationalItems) return null;
    return items.map((item, i) => {
      return (
        <LayerListItem
          key={i}
          item={item}
          onVisibilityClick={handleItemVisibilityClick}
        >
          {item.children.length > 0 && (
            <CalciteList>{renderItems(item.children)}</CalciteList>
          )}
        </LayerListItem>
      );
    });
  };

  useEffect(() => {
    const view = props.view;
    if (!view) {
      return;
    }
    layerListVM.current = new LayerListViewModel({
      listItemCreatedFunction: props.listItemCreatedFunction,
      view
    });
    const currLayerListVM = layerListVM.current;
    const stateHandle = reactiveUtils.when(
      () => currLayerListVM.state === 'ready',
      () => {
        setOperationalItems(currLayerListVM.operationalItems.clone());
      }
    );
    const watchHandle = reactiveUtils.watch(
      () =>
        currLayerListVM.operationalItems
          .flatten((item) => item.children)
          .filter((item) => !!item.title)
          .toArray(),
      () => {
        setOperationalItems(currLayerListVM.operationalItems.clone());
      }
    );
    return () => {
      watchHandle.remove();
      stateHandle.remove();
    };
  }, [props.view]);

  return (
    <div ref={props.ref}>
      {operationalItems &&
        (operationalItems.length > 0 ? (
          <CalciteList filterEnabled>
            {renderItems(operationalItems)}
          </CalciteList>
        ) : (
          <div className="m-5">
            <CalciteNotice
              open
              icon="information"
              kind="info"
            >
              <div slot="message">There are currently no items to display.</div>
            </CalciteNotice>
          </div>
        ))}
    </div>
  );
};

export default LayerList;
