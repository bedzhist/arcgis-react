import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import LayerListViewModel from '@arcgis/core/widgets/LayerList/LayerListViewModel';
import {
  CalciteAction,
  CalciteActionMenu,
  CalciteList,
  CalciteListItem,
  CalciteNotice
} from '@esri/calcite-components-react';
import { CalciteListItemCustomEvent } from '@esri/calcite-components/dist/types';
import { useEffect, useRef, useState } from 'react';

export interface LayerListProps {
  ref?: React.RefObject<HTMLDivElement>;
  view?: __esri.MapView;
  listItemCreatedFunction?: __esri.LayerListListItemCreatedHandler;
}

interface LayerListItemProps {
  children?: React.ReactNode;
  item: __esri.ListItem;
  operationalItems: __esri.Collection<__esri.ListItem>;
}

const getToggledActions = (
  actionsSections: __esri.Collection<
    __esri.Collection<__esri.ActionButton | __esri.ActionToggle>
  >
) => {
  return actionsSections.reduce<string[]>((acc, section) => {
    return acc.concat(
      section
        .filter((action) => action.type === 'toggle' && action.value === true)
        .map((action) => action.id)
        .toArray()
    );
  }, []);
};

const LayerListItem = (props: LayerListItemProps) => {
  const [visible, setVisible] = useState(props.item.visible);
  const [toggledActions, setToggledActions] = useState<string[]>(() =>
    getToggledActions(props.item.actionsSections)
  );

  const handleVisibilityClick = (
    event: React.MouseEvent<HTMLCalciteActionElement, MouseEvent>
  ) => {
    const item = props.item;
    const parent = item.parent;
    const shiftKey = event.shiftKey;
    const visible = item.visible;
    if (shiftKey) {
      if (parent) {
        parent.children.forEach((child) => {
          if (child.hidden) return;
          child.visible = !visible;
        });
      } else {
        props.operationalItems.forEach((operationalItem) => {
          if (operationalItem.hidden) return;
          operationalItem.visible = !visible;
        });
      }
    }
    props.item.visible = !visible;
  };
  const handleSelect = (event: CalciteListItemCustomEvent<void>) => {
    event.stopPropagation();
    const item = props.item;
    item.visible = !item.visible;
  };
  const toggleAction = (action: __esri.ActionButton | __esri.ActionToggle) => {
    if (action.type !== 'toggle') return;
    const value = action.value;
    action.value = !value;
    /*  if (action.value) {
      setToggledActions([...toggledActions, action.id]);
    } else {
      setToggledActions(toggledActions.filter((id) => id !== action.id));
    } */
    /*  const actionToggle = actionsSections.getItemAt(0).getItemAt(1);
    if (actionToggle.type !== 'toggle') return;
    actionToggle.value = !actionToggle.value;
    console.log(action, actionToggle); */
  };

  useEffect(() => {
    const item = props.item;
    const visibilityHandle = item.watch('visible', (visible) => {
      setVisible(visible);
    });
    return () => {
      visibilityHandle.remove();
    };
  }, [props.item]);
  useEffect(() => {
    const toggledActionsHandle = reactiveUtils.watch(
      () => getToggledActions(props.item.actionsSections),
      (toggledActions) => {
        setToggledActions(toggledActions);
      }
    );
    return () => {
      toggledActionsHandle.remove();
    };
  }, [props.item]);

  return (
    <CalciteListItem
      title={props.item.title}
      className="esri-layer-list__item"
      value={props.item.title}
      onCalciteListItemSelect={handleSelect}
    >
      <CalciteAction
        slot="actions-start"
        icon={visible ? 'check-square-f' : 'square'}
        text="Visibility"
        scale="s"
        appearance="transparent"
        onClick={handleVisibilityClick}
      />
      <div
        slot="content"
        className="esri-layer-list__item-content"
      >
        {props.item.title}
      </div>
      {props.children}
      {props.item.actionsSections.length > 0 && (
        <CalciteActionMenu
          label="Actions"
          slot="actions-end"
          overlayPositioning="fixed"
          placement="bottom-end"
          scale="s"
        >
          {props.item.actionsSections.map((actionsSection) =>
            actionsSection.map((action, i) => {
              return (
                <CalciteAction
                  key={i}
                  icon={action.icon}
                  text={action.title}
                  textEnabled
                  scale="s"
                  active={toggledActions.includes(action.id)}
                  onClick={() => toggleAction(action)}
                />
              );
            })
          )}
        </CalciteActionMenu>
      )}
    </CalciteListItem>
  );
};

export const LayerList = (props: LayerListProps) => {
  const layerListVM = useRef<__esri.LayerListViewModel>(
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
      () => currLayerListVM.operationalItems.map((item) => item),
      (operationalItems) => {
        setOperationalItems(operationalItems.clone());
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
          >
            <div slot="message">There are currently no items to display.</div>
          </CalciteNotice>
        </div>
      )}
    </div>
  );
};

export default LayerList;
