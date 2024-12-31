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
  const layerListVM = useValue<__esri.LayerListViewModel>(
    new LayerListViewModel({
      listItemCreatedFunction: props.listItemCreatedFunction
    })
  );

  const [operationalItems, setOperationalItems] =
    useState<__esri.Collection<__esri.ListItem>>();

  const renderItems = (items: __esri.Collection<__esri.ListItem>) => {
    if (!operationalItems) return null;
    return items.map((item, i) => {
      return (
        <LayerListItem
          key={i}
          item={item}
          operationalItems={operationalItems}
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
    const currLayerListVM = layerListVM.current;
    currLayerListVM.view = view;
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
    };
  }, [props.view]);

  return (
    <div ref={props.ref}>
      {operationalItems && operationalItems.length > 0 ? (
        <CalciteList filterEnabled>{renderItems(operationalItems)}</CalciteList>
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
      )}
    </div>
  );
};

export default LayerList;
