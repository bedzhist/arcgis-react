import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Widget from '@arcgis/core/widgets/Widget';
import { CalciteListItemCustomEvent } from '@esri/calcite-components';
import {
  CalciteAction,
  CalciteActionGroup,
  CalciteActionMenu,
  CalciteListItem
} from '@esri/calcite-components-react';
import { useEffect, useState } from 'react';

export interface LayerListItemProps {
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

export const LayerListItem = (props: LayerListItemProps) => {
  const [visible, setVisible] = useState(props.item.visible);
  const [toggledActions, setToggledActions] = useState<string[]>(() =>
    getToggledActions(props.item.actionsSections)
  );
  const [panelOpen, setPanelOpen] = useState(false);

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
  };
  const renderActions = () => {
    const actions = props.item.actionsSections;
    if (actions.length === 0) return;
    if (actions.length === 1) {
      const actionsSection = actions.getItemAt(0);
      if (actionsSection.length === 0) return;
      if (actionsSection.length === 1) {
        const action = actionsSection.getItemAt(0);
        return (
          <CalciteAction
            slot="actions-end"
            icon={action.icon}
            text={action.title}
            title={action.title}
            scale="s"
            appearance="transparent"
            active={toggledActions.includes(action.id)}
            onClick={() => toggleAction(action)}
          />
        );
      }
    }
    return (
      <CalciteActionMenu
        label="Actions"
        slot="actions-end"
        overlayPositioning="fixed"
        placement="bottom-end"
        scale="s"
      >
        {actions.map((actionsSection, i) => (
          <CalciteActionGroup key={i}>
            {actionsSection.map((action, i) => {
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
            })}
          </CalciteActionGroup>
        ))}
      </CalciteActionMenu>
    );
  };
  const renderPanel = () => {
    const panel = props.item.panel;
    if (!panel) return;
    const content = panel.content;
    if (Array.isArray(content)) {
      return;
    }
    return (
      <>
        <CalciteAction
          slot="actions-end"
          icon={panel.icon}
          text={panel.title}
          scale="s"
          appearance="transparent"
          onClick={() => {
            panel.open = !panel.open;
          }}
        />
        {panelOpen && (
          <div
            slot="content-bottom"
            className="esri-layer-list__item-content-bottom"
          >
            <div
              ref={(el) => {
                if (!el) return;
                if (content instanceof Widget) {
                  if (!content.container) {
                    content.container = document.createElement('div');
                  }
                  el.append(content.container);
                } else {
                  el.append(content);
                }
              }}
            />
          </div>
        )}
      </>
    );
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
  useEffect(() => {
    const panel = props.item.panel;
    if (!panel) return;
    const panelOpenHandle = panel.watch('open', (open) => {
      setPanelOpen(open);
    });
    return () => {
      panelOpenHandle.remove();
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
      {renderPanel()}
      {renderActions()}
    </CalciteListItem>
  );
};

export default LayerListItem;
