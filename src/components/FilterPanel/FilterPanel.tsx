import { CalciteSelectCustomEvent } from '@esri/calcite-components';
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
import { createRef, useMemo, useState } from 'react';
import { ArcGISLayer } from '../../types';
import { toUTCDateString } from '../../utils';
import CalciteLayerListCombobox, {
  CalciteLayerListComboboxChangeItem,
  CalciteLayerListComboboxItem
} from '../CalciteLayerListCombobox';
import FilterPanelExpression, {
  FilterExpression,
  FilterOperator
} from '../FilterPanelExpression';
import { getOperators } from '../FilterPanelExpression/utils';

interface FilterPanelProps {
  view?: __esri.MapView | __esri.SceneView;
}

export type FilterPanelLayer = __esri.Sublayer | __esri.FeatureLayer;

enum FilterPanelLogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export function FilterPanel(props: FilterPanelProps) {
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

  const applyExpressions = (
    newExpressions: FilterExpression[],
    newLogicalOperator = logicalOperator
  ) => {
    if (!layer) return;
    if (!newExpressions.length) {
      layer.definitionExpression = '';
      return;
    }
    const where = newExpressions
      .reduce<string[]>((whereClauses, expression) => {
        switch (expression.operator) {
          case FilterOperator.IS:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} = '${expression.value}'`
              );
            }
            break;
          case FilterOperator.IS_NOT:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} != '${expression.value}'`
              );
            }
            break;
          case FilterOperator.EQUALS:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} = ${expression.value}`
              );
            }
            break;
          case FilterOperator.NOT_EQUALS:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} != ${expression.value}`
              );
            }
            break;
          case FilterOperator.CONTAINS:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} LIKE '%${expression.value}%'`
              );
            }
            break;
          case FilterOperator.DOES_NOT_CONTAIN:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} NOT LIKE '%${expression.value}%'`
              );
            }
            break;
          case FilterOperator.STRING_INCLUDES:
            if (expression.values.length) {
              const values = expression.values
                .map((value) => `'${value}'`)
                .join(',');
              whereClauses.push(`${expression.field.name} IN (${values})`);
            }
            break;
          case FilterOperator.STRING_EXCLUDES:
            if (expression.values.length) {
              const values = expression.values
                .map((value) => `'${value}'`)
                .join(',');
              whereClauses.push(`${expression.field.name} NOT IN (${values})`);
            }
            break;
          case FilterOperator.NUMBER_INCLUDES:
            if (expression.values.length) {
              const values = expression.values.join(',');
              whereClauses.push(`${expression.field.name} IN (${values})`);
            }
            break;
          case FilterOperator.NUMBER_EXCLUDES:
            if (expression.values.length) {
              const values = expression.values.join(',');
              whereClauses.push(`${expression.field.name} NOT IN (${values})`);
            }
            break;
          case FilterOperator.DATE_INCLUDES:
            if (expression.values.length) {
              const values = expression.values
                .map((value) => `TIMESTAMP '${value}'`)
                .join(',');
              whereClauses.push(`${expression.field.name} IN (${values})`);
            }
            break;
          case FilterOperator.DATE_EXCLUDES:
            if (expression.values.length) {
              const values = expression.values
                .map((value) => `TIMESTAMP '${value}'`)
                .join(',');
              whereClauses.push(`${expression.field.name} NOT IN (${values})`);
            }
            break;
          case FilterOperator.STARTS_WITH:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} LIKE '${expression.value}%'`
              );
            }
            break;
          case FilterOperator.ENDS_WITH:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} LIKE '%${expression.value}'`
              );
            }
            break;
          case FilterOperator.IS_BLANK:
            whereClauses.push(`${expression.field.name} IS NULL`);
            break;
          case FilterOperator.IS_NOT_BLANK:
            whereClauses.push(`${expression.field.name} IS NOT NULL`);
            break;
          case FilterOperator.IS_EMPTY_STRING:
            whereClauses.push(`${expression.field.name} = ''`);
            break;
          case FilterOperator.IS_NOT_EMPTY_STRING:
            whereClauses.push(`${expression.field.name} != ''`);
            break;
          case FilterOperator.IS_AT_LEAST:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} >= ${expression.value}`
              );
            }
            break;
          case FilterOperator.IS_LESS_THAN:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} < ${expression.value}`
              );
            }
            break;
          case FilterOperator.IS_AT_MOST:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} <= ${expression.value}`
              );
            }
            break;
          case FilterOperator.IS_GREATER_THAN:
            if (expression.value) {
              whereClauses.push(
                `${expression.field.name} > ${expression.value}`
              );
            }
            break;
          case FilterOperator.IS_ON:
            if (
              expression.values.length === 2 &&
              expression.values.every((v) => !!v)
            ) {
              const [dateString, timeString] = expression.values;
              const date = new Date(`${dateString} ${timeString}`);
              const utcDateString = toUTCDateString(date);
              whereClauses.push(
                `${expression.field.name} = TIMESTAMP '${utcDateString}'`
              );
            }
            break;
          case FilterOperator.IS_NOT_ON:
            if (
              expression.values.length === 2 &&
              expression.values.every((v) => !!v)
            ) {
              const [dateString, timeString] = expression.values;
              const date = new Date(`${dateString} ${timeString}`);
              const utcDateString = toUTCDateString(date);
              whereClauses.push(
                `${expression.field.name} != TIMESTAMP '${utcDateString}'`
              );
            }
            break;
          case FilterOperator.IS_BEFORE:
            if (
              expression.values.length === 2 &&
              expression.values.every((v) => !!v)
            ) {
              const [dateString, timeString] = expression.values;
              const date = new Date(`${dateString} ${timeString}`);
              const utcDateString = toUTCDateString(date);
              whereClauses.push(
                `${expression.field.name} < TIMESTAMP '${utcDateString}'`
              );
            }
            break;
          case FilterOperator.IS_AFTER:
            if (
              expression.values.length === 2 &&
              expression.values.every((v) => !!v)
            ) {
              const [dateString, timeString] = expression.values;
              const date = new Date(`${dateString} ${timeString}`);
              const utcDateString = toUTCDateString(date);
              whereClauses.push(
                `${expression.field.name} > TIMESTAMP '${utcDateString}'`
              );
            }
            break;
          case FilterOperator.IS_BEFORE_OR_EQUAL_TO:
            if (
              expression.values.length === 2 &&
              expression.values.every((v) => !!v)
            ) {
              const [dateString, timeString] = expression.values;
              const date = new Date(`${dateString} ${timeString}`);
              const utcDateString = toUTCDateString(date);
              whereClauses.push(
                `${expression.field.name} <= TIMESTAMP '${utcDateString}'`
              );
            }
            break;
          case FilterOperator.IS_AFTER_OR_EQUAL_TO:
            if (
              expression.values.length === 2 &&
              expression.values.every((v) => !!v)
            ) {
              const [dateString, timeString] = expression.values;
              const date = new Date(`${dateString} ${timeString}`);
              const utcDateString = toUTCDateString(date);
              whereClauses.push(
                `${expression.field.name} >= TIMESTAMP '${utcDateString}'`
              );
            }
            break;
          default: {
            console.error('Unknown operator:', expression.operator);
            return whereClauses;
          }
        }
        return whereClauses;
      }, [])
      .join(` ${newLogicalOperator} `);
    layer.definitionExpression = where;
  };
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
    const newExpressions: FilterExpression[] = [];
    setExpressions(newExpressions);
    applyExpressions(newExpressions);
  };
  const handleLogicalOperatorChange = (
    event: CalciteSelectCustomEvent<void>
  ) => {
    const value = event.target.value;
    if (Array.isArray(value)) return;
    const newLogicalOperator = value as FilterPanelLogicalOperator;
    setLogicalOperator(newLogicalOperator);
    applyExpressions(expressions, newLogicalOperator);
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
      values: [],
      fieldRef: createRef<HTMLCalciteComboboxElement | null>()
    };
    const newExpressions = [...expressions, newExpression];
    setExpressions(newExpressions);
    applyExpressions(newExpressions);
  };
  const handleExpressionDelete = (id: string) => {
    const newExpressions = expressions.filter((exp) => exp.id !== id);
    setExpressions(newExpressions);
    applyExpressions(newExpressions);
  };
  const handleRemoveAllClick = () => {
    setIsRemoveScrimOpen(true);
  };
  const handleRemoveAllCancelClick = () => {
    setIsRemoveScrimOpen(false);
  };
  const handleRemoveAllConfirmClick = () => {
    const newExpressions: FilterExpression[] = [];
    setExpressions(newExpressions);
    applyExpressions(newExpressions);
    setIsRemoveScrimOpen(false);
  };
  const handleExpressionChange = (expression: FilterExpression) => {
    const newExpressions = expressions.map((exp) =>
      exp.id === expression.id ? expression : exp
    );
    setExpressions(newExpressions);
    applyExpressions(newExpressions);
  };
  const handleNoticeClose = () => {
    setIsNoticeOpen(false);
  };

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
          onExpressionChange={handleExpressionChange}
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
}

export default FilterPanel;
