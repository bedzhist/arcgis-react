import {
  CalciteBlock,
  CalciteDropdown,
  CalciteAction,
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteSelect,
  CalciteOption,
  CalciteInput
} from '@esri/calcite-components-react';
import {
  CalciteComboboxCustomEvent,
  CalciteSelectCustomEvent,
  CalciteInputCustomEvent
} from '@esri/calcite-components';
import { FilterPanelLayer } from '../FilterPanel/FilterPanel';
import { useMemo } from 'react';
import { FilterExpression, FilterOperator } from './types';
import { getOperators } from './utils';

interface FilterPanelOperatorItem {
  value: FilterOperator;
  text: string;
}

export interface FilterPanelExpressionProps {
  expression: FilterExpression;
  layer: FilterPanelLayer | null;
  onDelete: (id: string) => void;
  onFieldChange: (
    event: CalciteComboboxCustomEvent<void>,
    expression: FilterExpression
  ) => void;
  onOperatorChange: (
    event: CalciteSelectCustomEvent<void>,
    expression: FilterExpression
  ) => void;
  onValueChange: (
    event: CalciteInputCustomEvent<void>,
    expression: FilterExpression
  ) => void;
}

export function FilterPanelExpression(props: FilterPanelExpressionProps) {
  const filterPanelOpearators = useMemo<FilterPanelOperatorItem[]>(() => {
    return [
      { value: FilterOperator.IS, text: 'is' },
      { value: FilterOperator.IS_NOT, text: 'is not' },
      { value: FilterOperator.EQUALS, text: 'equals' },
      { value: FilterOperator.NOT_EQUALS, text: 'does not equal' },
      { value: FilterOperator.CONTAINS, text: 'contains' }
    ];
  }, []);

  const handleDeleteClick = () => {
    props.onDelete(props.expression.id);
  };
  const handleFieldChange = (event: CalciteComboboxCustomEvent<void>) => {
    props.onFieldChange(event, props.expression);
  };
  const handleOperatorChange = (event: CalciteSelectCustomEvent<void>) => {
    props.onOperatorChange(event, props.expression);
  };
  const handleValueInput = (event: CalciteInputCustomEvent<void>) => {
    props.onValueChange(event, props.expression);
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

  return (
    <CalciteBlock
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
          onClick={handleDeleteClick}
        />
      </CalciteDropdown>
      <CalciteCombobox
        label="Field"
        selectionMode="single-persist"
        scale="s"
        className="mb-4"
        clearDisabled
        ref={props.expression.fieldRef}
        value={props.expression.field.name}
        onCalciteComboboxChange={handleFieldChange}
      >
        {props.layer?.fields.map((field) => (
          <CalciteComboboxItem
            key={field.name}
            value={field.name}
            textLabel={field.alias}
            selected={field === props.expression.field}
            icon={getFieldIcon(field)}
          />
        ))}
      </CalciteCombobox>
      <CalciteSelect
        label="Operator"
        scale="s"
        className="mb-4"
        value={props.expression.operator}
        onCalciteSelectChange={handleOperatorChange}
      >
        {filterPanelOpearators
          .filter((operator) =>
            getOperators(props.expression.field).includes(operator.value)
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
        type={getInputType(props.expression.field)}
        value={props.expression.value}
        onCalciteInputInput={handleValueInput}
      />
    </CalciteBlock>
  );
}

export default FilterPanelExpression;
