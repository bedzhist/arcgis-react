import {
  CalciteAction,
  CalciteBlock,
  CalciteButton,
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteDropdown,
  CalciteFab,
  CalciteInput,
  CalciteLabel,
  CalciteNotice,
  CalciteOption,
  CalcitePanel,
  CalciteScrim,
  CalciteSelect
} from '@esri/calcite-components-react';
import {
  CalciteComboboxCustomEvent,
  CalciteInputCustomEvent,
  CalciteSelectCustomEvent
} from '@esri/calcite-components';
import _ from 'lodash';
import { createRef, useEffect, useMemo, useState } from 'react';
import { ArcGISLayer } from '../../types';
import CalciteLayerListCombobox, {
  CalciteLayerListComboboxChangeItem,
  CalciteLayerListComboboxItem
} from '../CalciteLayerListCombobox';

interface FilterPanelProps {
  view?: __esri.MapView;
}

type FilterPanelLayer = __esri.Sublayer | __esri.FeatureLayer;
interface FilterPanelExpression {
  id: string;
  fieldRef: React.RefObject<HTMLCalciteComboboxElement | null>;
  field: __esri.Field;
  operator: FilterPanelOperator;
  value: string;
}

enum FilterPanelOperator {
  IS = 'IS',
  IS_NOT = 'IS_NOT',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS'
}

enum FilterPanelLogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

interface FilterPanelOperatorItem {
  value: FilterPanelOperator;
  text: string;
}

export const FilterPanel = (props: FilterPanelProps) => {
  const [layerItem, setLayerItem] =
    useState<CalciteLayerListComboboxItem | null>(null);
  const [expressions, setExpressions] = useState<FilterPanelExpression[]>([]);
  const [logicalOperator, setLogicalOperator] =
    useState<FilterPanelLogicalOperator>(FilterPanelLogicalOperator.AND);
  const [isRemoveScrimOpen, setIsRemoveScrimOpen] = useState<boolean>(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState<boolean>(true);

  const layer = useMemo<FilterPanelLayer | null>(() => {
    if (!layerItem) return null;
    return layerItem.layer as FilterPanelLayer;
  }, [layerItem]);
  const filterPanelOpearators = useMemo<FilterPanelOperatorItem[]>(() => {
    return [
      { value: FilterPanelOperator.IS, text: 'is' },
      { value: FilterPanelOperator.IS_NOT, text: 'is not' },
      { value: FilterPanelOperator.EQUALS, text: 'equals' },
      { value: FilterPanelOperator.NOT_EQUALS, text: 'does not equal' }
    ];
  }, []);

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
    const newExpression: FilterPanelExpression = {
      id: _.uniqueId(),
      field: field,
      operator: operator,
      value: '',
      fieldRef: createRef<HTMLCalciteComboboxElement | null>()
    };
    setExpressions((c) => [...c, newExpression]);
  };
  const removeExpression = (id: string) => {
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
  const getFieldIcon = (field: __esri.Field) => {
    switch (field.type) {
      case 'oid':
        return 'key';
      case 'string':
        return 'description';
      case 'integer':
      case 'big-integer':
      case 'small-integer':
        return 'number';
      default:
        return 'question';
    }
  };
  const getInputType = (field: __esri.Field) => {
    switch (field.type) {
      case 'oid':
      case 'integer':
      case 'big-integer':
      case 'small-integer':
        return 'number';
      case 'string':
        return 'text';
      default:
        return 'text';
    }
  };
  const getOperators = (field: __esri.Field) => {
    switch (field.type) {
      case 'string':
        return [FilterPanelOperator.IS, FilterPanelOperator.IS_NOT];
      case 'oid':
      case 'integer':
      case 'big-integer':
      case 'small-integer':
        return [FilterPanelOperator.EQUALS, FilterPanelOperator.NOT_EQUALS];
      default:
        return [];
    }
  };
  const updateField = (
    event: CalciteComboboxCustomEvent<void>,
    expression: FilterPanelExpression
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
  const updateOperator = (
    event: CalciteSelectCustomEvent<void>,
    expression: FilterPanelExpression
  ) => {
    const value = event.target.value;
    if (Array.isArray(value)) return;
    const operator = value as FilterPanelOperator;
    setExpressions((c) =>
      c.map((exp) =>
        exp.id === expression.id ? { ...exp, operator, value: '' } : exp
      )
    );
  };
  const updateValue = (
    event: CalciteInputCustomEvent<void>,
    expression: FilterPanelExpression
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
        .map((expression) => {
          if (expression.value === '') return '';
          switch (expression.operator) {
            case FilterPanelOperator.IS:
              return `${expression.field.name} = '${expression.value}'`;
            case FilterPanelOperator.IS_NOT:
              return `${expression.field.name} != '${expression.value}'`;
            case FilterPanelOperator.EQUALS:
              return `${expression.field.name} = ${expression.value}`;
            case FilterPanelOperator.NOT_EQUALS:
              return `${expression.field.name} != ${expression.value}`;
            default:
              return '';
          }
        })
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
        <CalciteBlock
          key={expression.id}
          heading="Expression"
          open
        >
          <CalciteDropdown
            slot="control"
            overlayPositioning="fixed"
            placement="bottom-end"
          >
            <CalciteAction
              slot="trigger"
              icon="ellipsis"
              text=""
            />
            <CalciteAction
              text="Delete"
              icon="trash"
              textEnabled
              onClick={() => removeExpression(expression.id)}
            />
          </CalciteDropdown>
          <CalciteCombobox
            label="Field"
            selectionMode="single-persist"
            scale="s"
            className="mb-4"
            clearDisabled
            ref={expression.fieldRef}
            value={expression.field.name}
            onCalciteComboboxChange={(e) => updateField(e, expression)}
          >
            {layer?.fields.map((field) => (
              <CalciteComboboxItem
                key={field.name}
                value={field.name}
                textLabel={field.alias}
                selected={field === expression.field}
                icon={getFieldIcon(field)}
              />
            ))}
          </CalciteCombobox>
          <CalciteSelect
            label="Operator"
            scale="s"
            className="mb-4"
            value={expression.operator}
            onCalciteSelectChange={(e) => updateOperator(e, expression)}
          >
            {filterPanelOpearators
              .filter((operator) =>
                getOperators(expression.field).includes(operator.value)
              )
              .map((operator) => (
                <CalciteOption
                  key={operator.value}
                  value={operator.value}
                >
                  {operator.text}
                </CalciteOption>
              ))}
          </CalciteSelect>
          <CalciteInput
            label="Value"
            scale="s"
            className="mb-4"
            type={getInputType(expression.field)}
            value={expression.value}
            onCalciteInputInput={(e) => {
              updateValue(e, expression);
            }}
          />
        </CalciteBlock>
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
