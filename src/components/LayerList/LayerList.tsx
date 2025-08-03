import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';
import { useEffect, useState } from 'react';
import LayerListItem from './LayerListItem';

export interface LayerListProps {
  ref?: React.RefObject<HTMLDivElement>;
  view?: __esri.MapView | __esri.SceneView;
  listItemCreatedCallback?: __esri.LayerListListItemCreatedHandler;
}

export function LayerList(props: LayerListProps) {
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
            <calcite-list label="">{renderItems(item.children)}</calcite-list>
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
    const newLayerListVM = new LayerListViewModel({
      listItemCreatedFunction: props.listItemCreatedCallback,
      view
    });
    const stateHandle = reactiveUtils.when(
      () => newLayerListVM.state === 'ready',
      () => {
        setOperationalItems(newLayerListVM.operationalItems.clone());
      }
    );
    const watchHandle = reactiveUtils.watch(
      () =>
        newLayerListVM.operationalItems
          .flatten((item) => item.children)
          .filter((item) => !!item.title)
          .toArray(),
      () => {
        setOperationalItems(newLayerListVM.operationalItems.clone());
      },
      {
        initial: true
      }
    );
    return () => {
      watchHandle.remove();
      stateHandle.remove();
    };
  }, [props.view, props.listItemCreatedCallback]);

  return (
    <div ref={props.ref}>
      {operationalItems &&
        (operationalItems.length > 0 ? (
          <calcite-list
            filter-enabled
            label=""
          >
            {renderItems(operationalItems)}
          </calcite-list>
        ) : (
          <div className="m-5">
            <calcite-notice
              open
              icon="information"
              kind="info"
            >
              <div slot="message">There are currently no items to display.</div>
            </calcite-notice>
          </div>
        ))}
    </div>
  );
}

export default LayerList;
