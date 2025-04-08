import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Widget from '@arcgis/core/widgets/Widget';
import { TargetedEvent } from '@esri/calcite-components';
import { useEffect, useState } from 'react';

export interface LayerListItemProps {
  children?: React.ReactNode;
  item: __esri.ListItem;
  onVisibilityClick?: (
    event: React.MouseEvent<HTMLCalciteActionElement, MouseEvent>,
    value: boolean,
    item: __esri.ListItem
  ) => void;
}

const getToggledActions = (
  actionsSections: __esri.Collection<
    __esri.Collection<__esri.ActionButton | __esri.ActionToggle>
  >
) => {
  return actionsSections.reduce<string[]>((acc, section) => {
    return acc.concat(
      section
        .filter(
          (action) =>
            action.type === 'toggle' && action.value === true && !!action.id
        )
        .map((action) => action.id ?? '')
        .toArray()
    );
  }, []);
};

export function LayerListItem(props: LayerListItemProps) {
  const [visible, setVisible] = useState(props.item.visible);
  const [toggledActions, setToggledActions] = useState<string[]>(() =>
    getToggledActions(props.item.actionsSections)
  );
  const [panelOpen, setPanelOpen] = useState(false);

  const handleVisibilityClick = (
    event: React.MouseEvent<HTMLCalciteActionElement, MouseEvent>
  ) => {
    const item = props.item;
    const newVisible = !item.visible;
    item.visible = newVisible;
    props.onVisibilityClick?.(event, newVisible, item);
  };
  const handleSelect = (
    event: TargetedEvent<HTMLCalciteListItemElement, undefined>
  ) => {
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
      if (!actionsSection || actionsSection.length === 0) return;
      if (actionsSection.length === 1) {
        const action = actionsSection.getItemAt(0);
        if (!action || !action.id) return null;
        return (
          <calcite-action
            slot="actions-end"
            icon={action.icon ?? 'ellipsis'}
            text={action.title ?? 'Actions'}
            title={action.title ?? 'Actions'}
            scale="s"
            appearance="transparent"
            active={toggledActions.includes(action.id)}
            onClick={() => toggleAction(action)}
          />
        );
      }
    }
    return (
      <calcite-action-menu
        label="Actions"
        slot="actions-end"
        overlay-positioning="fixed"
        placement="bottom-end"
        scale="s"
      >
        {actions.map((actionsSection, i) => (
          <calcite-action-group key={i}>
            {actionsSection.map((action, i) => {
              if (!action.id) {
                return null;
              }
              return (
                <calcite-action
                  key={i}
                  icon={action.icon ?? 'ellipsis'}
                  text={action.title ?? 'Action'}
                  text-enabled
                  scale="s"
                  active={toggledActions.includes(action.id)}
                  onClick={() => toggleAction(action)}
                />
              );
            })}
          </calcite-action-group>
        ))}
      </calcite-action-menu>
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
        <calcite-action
          slot="actions-end"
          icon={panel.icon ?? 'ellipsis'}
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
                if (!el || !content) return;
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
    <calcite-list-item
      title={props.item.title}
      className="esri-layer-list__item"
      value={props.item.title}
      oncalciteListItemSelect={handleSelect}
    >
      <calcite-action
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
    </calcite-list-item>
  );
}

export default LayerListItem;
