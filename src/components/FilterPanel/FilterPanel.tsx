import {
  CalciteComboboxCustomEvent,
  CalciteInputCustomEvent,
  CalciteSelectCustomEvent
} from '@esri/calcite-components';
import {
  CalciteButton,
  CalciteFab,
  CalciteLabel,
  CalciteNotice,
  CalciteOption,
  CalcitePanel,
  CalciteScrim,
  CalciteSelect
} from '@esri/calcite-components-react';
import _ from 'lodash';
import { createRef, useEffect, useMemo, useState } from 'react';
import { ArcGISLayer } from '../../types';
import { getOperators } from '../FilterPanelExpression/utils';
import CalciteLayerListCombobox, {
  CalciteLayerListComboboxChangeItem,
  CalciteLayerListComboboxItem
} from '../CalciteLayerListCombobox';
import FilterPanelExpression, {
  FilterExpression,
  FilterOperator
} from '../FilterPanelExpression';

interface FilterPanelProps {
  view?: __esri.MapView | __esri.SceneView;
}

export type FilterPanelLayer = __esri.Sublayer | __esri.FeatureLayer;

enum FilterPanelLogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export const FilterPanel = (props: FilterPanelProps) => {
  const [layerItem, setLayerItem] =
    useState<CalciteLayerListComboboxItem | null>(null);
  const [expressions, setExpressions] = useState<FilterExpression[]>([]);
  const [logicalOperator, setLogicalOperator] =
    useState<FilterPanelLogicalOperator>(FilterPanelLogicalOperator.AND);
  const [isRemoveScrimOpen, setIsRemoveScrimOpen] = useState<boolean>(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(true);

  const layer = useMemo<FilterPanelLayer | null>(() => {
    if (!layerItem) return null;
    return layerItem.layer as FilterPanelLayer;
  }, [layerItem]);

  const handleLayerChange = async (
    item: CalciteLayerListComboboxChangeItem
  ) => {
    if (Array.isArray(item)) return;
    if (item) {
      const layer = item.layer as ArcGISLayer;
      switch (layer.type) {
        case 'feature': {
          break;
        }
        case 'sublayer': {
          await layer.load();
          break;
        }
      }
      props.view?.goTo(layer.fullExtent);
    } else {
      if (!layer) return;
      layer.definitionExpression = '';
    }
    setLayerItem(item);
    setExpressions([]);
  };
  const handleLogicalOperatorChange = (
    event: CalciteSelectCustomEvent<void>
  ) => {
    const value = event.target.value;
    if (Array.isArray(value)) return;
    const operator = value as FilterPanelLogicalOperator;
    setLogicalOperator(operator);
  };
  const handleAddExpressionClick = () => {
    if (!layer) return;
    const field = layer.fields[0];
    const operator = getOperators(field)[0];
    const newExpression: FilterExpression = {
      id: _.uniqueId(),
      field: field,
      operator: operator,
      value: '',
      fieldRef: createRef<HTMLCalciteComboboxElement | null>()
    };
    setExpressions((c) => [...c, newExpression]);
  };
  const handleExpressionDelete = (id: string) => {
    setExpressions(expressions.filter((exp) => exp.id !== id));
  };
  const handleRemoveAllClick = () => {
    setIsRemoveScrimOpen(true);
  };
  const handleRemoveAllCancelClick = () => {
    setIsRemoveScrimOpen(false);
  };
  const handleRemoveAllConfirmClick = () => {
    setExpressions([]);
    setIsRemoveScrimOpen(false);
  };

  const handleExpressionFieldChange = (
    event: CalciteComboboxCustomEvent<void>,
    expression: FilterExpression
  ) => {
    const fieldName = event.target.value;
    if (Array.isArray(fieldName)) return;
    const field = layer?.fields.find((f) => f.name === fieldName);
    if (!field) return;
    setExpressions((c) =>
      c.map((exp) =>
        exp.id === expression.id
          ? { ...exp, field, operator: getOperators(field)[0], value: '' }
          : exp
      )
    );
  };
  const handleExpressionOperatorChange = (
    event: CalciteSelectCustomEvent<void>,
    expression: FilterExpression
  ) => {
    const value = event.target.value;
    if (Array.isArray(value)) return;
    const operator = value as FilterOperator;
    setExpressions((c) =>
      c.map((exp) =>
        exp.id === expression.id ? { ...exp, operator, value: '' } : exp
      )
    );
  };
  const handleExpressionValueChange = (
    event: CalciteInputCustomEvent<void>,
    expression: FilterExpression
  ) => {
    const value = event.target.value;
    setExpressions((c) =>
      c.map((exp) => (exp.id === expression.id ? { ...exp, value } : exp))
    );
  };
  const handleNoticeClose = () => {
    setIsNoticeOpen(false);
  };

  useEffect(() => {
    const applyExpressions = () => {
      if (!layer) return;
      if (!expressions.length) {
        layer.definitionExpression = '';
        return;
      }
      const where = expressions
        .reduce<string[]>((whereClauses, expression) => {
          if (expression.value === '') return whereClauses;
          switch (expression.operator) {
            case FilterOperator.IS:
              whereClauses.push(
                `${expression.field.name} = '${expression.value}'`
              );
              break;
            case FilterOperator.IS_NOT:
              whereClauses.push(
                `${expression.field.name} != '${expression.value}'`
              );
              break;
            case FilterOperator.EQUALS:
              whereClauses.push(
                `${expression.field.name} = ${expression.value}`
              );
              break;
            case FilterOperator.NOT_EQUALS:
              whereClauses.push(
                `${expression.field.name} != ${expression.value}`
              );
              break;
            case FilterOperator.CONTAINS:
              whereClauses.push(
                `${expression.field.name} LIKE '%${expression.value}%'`
              );
              break;
            default: {
              console.error('Unknown operator:', expression.operator);
              return whereClauses;
            }
          }
          return whereClauses;
        }, [])
        .join(` ${logicalOperator} `);
      layer.definitionExpression = where;
    };
    applyExpressions();
  }, [expressions, layer, logicalOperator]);

  return (
    <CalcitePanel
      heading="Filter"
      overlayPositioning="absolute"
    >
      <div
        slot="content-top"
        className="w-100 p-3"
      >
        <CalciteNotice
          open
          hidden={!isNoticeOpen}
          className="mb-7"
          icon="filter"
          closable
          onCalciteNoticeClose={handleNoticeClose}
        >
          <div slot="message">
            Add a filter by selecting a layer from the list.
          </div>
        </CalciteNotice>
        <CalciteLabel>
          Layer
          <CalciteLayerListCombobox
            view={props.view}
            label="Layer"
            selectionMode="single"
            value={layerItem?.id ?? ''}
            onCalciteLayerListComboboxChange={handleLayerChange}
            overlayPositioning="fixed"
          />
        </CalciteLabel>
        <CalciteLabel>
          Filter results
          <CalciteSelect
            label="Logical operator"
            value={logicalOperator}
            onCalciteSelectChange={handleLogicalOperatorChange}
          >
            <CalciteOption value={FilterPanelLogicalOperator.AND}>
              Match all expressions
            </CalciteOption>
            <CalciteOption value={FilterPanelLogicalOperator.OR}>
              Match at least one expression
            </CalciteOption>
          </CalciteSelect>
        </CalciteLabel>
        <CalciteButton
          width="full"
          appearance="outline"
          kind="danger"
          iconStart="trash"
          onClick={handleRemoveAllClick}
          className="text-truncate mt-3 mb-1"
          disabled={!expressions.length || undefined}
        >
          Remove all expressions
        </CalciteButton>
      </div>
      {expressions.map((expression) => (
        <FilterPanelExpression
          key={expression.id}
          expression={expression}
          layer={layer}
          onFieldChange={handleExpressionFieldChange}
          onOperatorChange={handleExpressionOperatorChange}
          onValueChange={handleExpressionValueChange}
          onDelete={handleExpressionDelete}
        />
      ))}
      <CalciteFab
        slot="fab"
        appearance="outline-fill"
        hidden={!layerItem}
        textEnabled
        text="Add expression"
        onClick={handleAddExpressionClick}
      />
      <CalciteScrim hidden={!isRemoveScrimOpen}>
        <div className="bottom-0 left-0 right-0 p-3 bg-1">
          <b>Remove all expressions</b>
          <p>Are you sure? All expressions will be removed.</p>
          <div className="d-flex">
            <CalciteButton
              width="full"
              appearance="outline"
              onClick={handleRemoveAllCancelClick}
            >
              Cancel
            </CalciteButton>
            <CalciteButton
              width="full"
              onClick={handleRemoveAllConfirmClick}
            >
              Ok
            </CalciteButton>
          </div>
        </div>
      </CalciteScrim>
    </CalcitePanel>
  );
};

export default FilterPanel;
