import {
  CalciteComboboxCustomEvent,
  CalciteInputCustomEvent,
  CalciteInputDatePickerCustomEvent,
  CalciteInputTimePickerCustomEvent,
  CalciteListCustomEvent,
  CalciteSelectCustomEvent
} from '@esri/calcite-components';
import {
  CalciteAction,
  CalciteBlock,
  CalciteButton,
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteDropdown,
  CalciteInput,
  CalciteInputDatePicker,
  CalciteInputTimePicker,
  CalciteList,
  CalciteListItem,
  CalciteOption,
  CalcitePopover,
  CalciteSelect
} from '@esri/calcite-components-react';
import { useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { FilterPanelLayer } from '../FilterPanel/FilterPanel';
import { FilterExpression, FilterOperator } from './types';
import { getOperators } from './utils';
import _ from 'lodash';
import { toUTCDateString } from '../../utils';

interface FilterPanelOperatorItem {
  value: FilterOperator;
  text: string;
}

interface FilterPanelExpressionValueOption {
  label: string;
  value: string;
  count: number;
}

export interface FilterPanelExpressionProps {
  expression: FilterExpression;
  layer: FilterPanelLayer | null;
  onDelete: (id: string) => void;
  onExpressionChange: (expression: FilterExpression) => void;
}

export function FilterPanelExpression(props: FilterPanelExpressionProps) {
  // const selectValuesPopoverRef = useRef<HTMLCalcitePopoverElement>(null);

  const [selectValuesButtonRef, setSelectValuesButtonRef] =
    useState<HTMLCalciteButtonElement | null>(null);
  const [uniqueValueOptions, setUniqueValueOptions] = useState<
    FilterPanelExpressionValueOption[]
  >([]);
  const [uniqueValuePopoverOpen, setUniqueValuePopoverOpen] =
    useState<boolean>(false);
  const [
    exceededUniqueValuesTransferLimit,
    setExceededUniqueValuesTransferLimit
  ] = useState<boolean>(false);

  const filterPanelOpearators = useMemo<FilterPanelOperatorItem[]>(() => {
    return [
      { value: FilterOperator.IS, text: 'is' },
      { value: FilterOperator.IS_NOT, text: 'is not' },
      { value: FilterOperator.EQUALS, text: 'equals' },
      { value: FilterOperator.NOT_EQUALS, text: 'does not equal' },
      {
        value: FilterOperator.IS_ON,
        text: 'is on'
      },
      {
        value: FilterOperator.IS_NOT_ON,
        text: 'is not on'
      },
      {
        value: FilterOperator.IS_BEFORE,
        text: 'is before'
      },
      {
        value: FilterOperator.IS_AFTER,
        text: 'is after'
      },
      {
        value: FilterOperator.IS_BEFORE_OR_EQUAL_TO,
        text: 'is before or equal to'
      },
      {
        value: FilterOperator.IS_AFTER_OR_EQUAL_TO,
        text: 'is after or equal to'
      },
      { value: FilterOperator.IS_AT_LEAST, text: 'is at least' },
      { value: FilterOperator.IS_LESS_THAN, text: 'is less than' },
      { value: FilterOperator.IS_AT_MOST, text: 'is at most' },
      { value: FilterOperator.IS_GREATER_THAN, text: 'is greater than' },
      { value: FilterOperator.STARTS_WITH, text: 'starts with' },
      { value: FilterOperator.ENDS_WITH, text: 'ends with' },
      { value: FilterOperator.CONTAINS, text: 'contains the text' },
      {
        value: FilterOperator.DOES_NOT_CONTAIN,
        text: 'does not contain the text'
      },
      { value: FilterOperator.STRING_INCLUDES, text: 'includes' },
      { value: FilterOperator.STRING_EXCLUDES, text: 'excludes' },
      { value: FilterOperator.NUMBER_INCLUDES, text: 'includes' },
      { value: FilterOperator.NUMBER_EXCLUDES, text: 'excludes' },
      { value: FilterOperator.DATE_INCLUDES, text: 'includes' },
      { value: FilterOperator.DATE_EXCLUDES, text: 'excludes' },
      { value: FilterOperator.IS_BLANK, text: 'is blank' },
      { value: FilterOperator.IS_NOT_BLANK, text: 'is not blank' },
      { value: FilterOperator.IS_EMPTY_STRING, text: 'is empty string' },
      {
        value: FilterOperator.IS_NOT_EMPTY_STRING,
        text: 'is not empty string'
      }
    ];
  }, []);

  const handleDeleteClick = () => {
    props.onDelete(props.expression.id);
  };
  const handleFieldChange = (event: CalciteComboboxCustomEvent<void>) => {
    const fieldName = event.target.value;
    if (Array.isArray(fieldName)) return;
    const field = props.layer?.fields.find((f) => f.name === fieldName);
    if (!field) {
      // TODO: Handle error
      return;
    }
    props.onExpressionChange({
      ...props.expression,
      field,
      operator: getOperators(field)[0],
      value: '',
      values: []
    });
  };
  const handleOperatorChange = async (
    event: CalciteSelectCustomEvent<void>
  ) => {
    const layer = props.layer;
    if (!layer) {
      // TODO: Handle error
      return;
    }
    const value = event.target.value;
    if (Array.isArray(value)) {
      // TODO: Handle error
      return;
    }
    const operator = value as FilterOperator;
    const expression: FilterExpression = {
      ...props.expression,
      operator,
      value: '',
      values: []
    };
    if (
      operator === FilterOperator.STRING_INCLUDES ||
      operator === FilterOperator.STRING_EXCLUDES ||
      operator === FilterOperator.NUMBER_INCLUDES ||
      operator === FilterOperator.NUMBER_EXCLUDES ||
      operator === FilterOperator.DATE_INCLUDES ||
      operator === FilterOperator.DATE_EXCLUDES
    ) {
      const response = await layer.queryFeatures({
        where: '1=1',
        outFields: [props.expression.field.name],
        groupByFieldsForStatistics: [props.expression.field.name],
        outStatistics: [
          {
            statisticType: 'count',
            onStatisticField: props.expression.field.name,
            outStatisticFieldName: 'count'
          }
        ]
      });
      setExceededUniqueValuesTransferLimit(response.exceededTransferLimit);
      const features = response.features.sort(
        (a, b) => b.attributes['count'] - a.attributes['count']
      );
      setUniqueValueOptions(
        features.map((feature) => {
          let value = feature.attributes[props.expression.field.name];
          let label = value;
          if (
            operator === FilterOperator.DATE_INCLUDES ||
            operator === FilterOperator.DATE_EXCLUDES
          ) {
            const date = new Date(value);
            label = date.toLocaleString();
            value = toUTCDateString(date);
          }
          return {
            value,
            label,
            count: feature.attributes['count']
          };
        })
      );
    }
    props.onExpressionChange(expression);
  };
  const handleValueInput = (event: CalciteInputCustomEvent<void>) => {
    const value = event.target.value;
    const expression = { ...props.expression, value };
    props.onExpressionChange(expression);
  };
  const handleValuesChange = (event: CalciteListCustomEvent<void>) => {
    const values = event.target.selectedItems.map((item) => item.value);
    props.onExpressionChange({ ...props.expression, values });
  };
  const handleDateValueChange = (
    event: CalciteInputDatePickerCustomEvent<void>
  ) => {
    let value = event.target.value;
    if (Array.isArray(value)) {
      // TODO: Handle error
      return;
    }
    const expression = {
      ...props.expression,
      values: [value, props.expression.values[1] || '']
    };
    props.onExpressionChange(expression);
  };
  const handleTimeValueChange = (
    event: CalciteInputTimePickerCustomEvent<void>
  ) => {
    const value = event.target.value;
    const expression = {
      ...props.expression,
      values: [props.expression.values[0] || '', value]
    };
    props.onExpressionChange(expression);
  };
  const handleValuesOpenClick = () => {
    setUniqueValuePopoverOpen(true);
  };
  const handleValuesDoneClick = () => {
    setUniqueValuePopoverOpen(false);
  };
  const removeValuesItem = (value: string) => {
    const values = props.expression.values.filter((v) => v !== value);
    props.onExpressionChange({ ...props.expression, values });
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
      case 'date':
        return 'calendar';
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
  const renderValueSelector = () => {
    if (
      props.expression.operator === FilterOperator.STRING_INCLUDES ||
      props.expression.operator === FilterOperator.STRING_EXCLUDES ||
      props.expression.operator === FilterOperator.NUMBER_INCLUDES ||
      props.expression.operator === FilterOperator.NUMBER_EXCLUDES ||
      props.expression.operator === FilterOperator.DATE_INCLUDES ||
      props.expression.operator === FilterOperator.DATE_EXCLUDES
    ) {
      return (
        <>
          <CalciteButton
            ref={setSelectValuesButtonRef}
            appearance="transparent"
            width="full"
            scale="s"
            className="mb-4"
            onClick={handleValuesOpenClick}
          >
            Select values
          </CalciteButton>
          {uniqueValuePopoverOpen &&
            ReactDOM.createPortal(
              <CalcitePopover
                label="Select values"
                referenceElement={selectValuesButtonRef || ''}
                placement="right-start"
              >
                <div>
                  <CalciteList
                    selectionMode="multiple"
                    filterEnabled
                    onCalciteListChange={handleValuesChange}
                    className="overflow-y-auto"
                    style={{ maxHeight: '240px' }}
                  >
                    {uniqueValueOptions.map((option) => (
                      <CalciteListItem
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        selected={props.expression.values.includes(
                          option.value
                        )}
                      >
                        <div
                          slot="actions-end"
                          className="p-5 text-2"
                        >
                          {option.count}
                        </div>
                      </CalciteListItem>
                    ))}
                  </CalciteList>
                  {exceededUniqueValuesTransferLimit && (
                    <div className="m-4 text-2">
                      Too many values to display.
                    </div>
                  )}
                  <div className="p-3">
                    <CalciteButton
                      width="full"
                      scale="s"
                      onClick={handleValuesDoneClick}
                    >
                      Done
                    </CalciteButton>
                  </div>
                </div>
              </CalcitePopover>,
              document.body
            )}
          <CalciteList selectionMode="none">
            {props.expression.values.map((value) => (
              <CalciteListItem
                key={value}
                label={value}
                value={value}
              >
                <CalciteAction
                  slot="actions-end"
                  icon="x"
                  text=""
                  scale="s"
                  onClick={() => removeValuesItem(value)}
                />
              </CalciteListItem>
            ))}
          </CalciteList>
        </>
      );
    }
    if (
      props.expression.operator === FilterOperator.IS_ON ||
      props.expression.operator === FilterOperator.IS_NOT_ON ||
      props.expression.operator === FilterOperator.IS_BEFORE ||
      props.expression.operator === FilterOperator.IS_AFTER ||
      props.expression.operator === FilterOperator.IS_BEFORE_OR_EQUAL_TO ||
      props.expression.operator === FilterOperator.IS_AFTER_OR_EQUAL_TO
    ) {
      return (
        <div className="d-flex mb-4">
          <CalciteInputDatePicker
            scale="s"
            value={props.expression.values[0]}
            className="flex-1"
            onCalciteInputDatePickerChange={handleDateValueChange}
          />
          <CalciteInputTimePicker
            scale="s"
            value={props.expression.values[1]}
            step={1}
            className="flex-1"
            onCalciteInputTimePickerChange={handleTimeValueChange}
          />
        </div>
      );
    }
    if (
      props.expression.operator !== FilterOperator.IS_BLANK &&
      props.expression.operator !== FilterOperator.IS_NOT_BLANK &&
      props.expression.operator !== FilterOperator.IS_EMPTY_STRING &&
      props.expression.operator !== FilterOperator.IS_NOT_EMPTY_STRING
    ) {
      return (
        <CalciteInput
          label="Value"
          scale="s"
          className="mb-4"
          type={getInputType(props.expression.field)}
          value={props.expression.value}
          onCalciteInputInput={handleValueInput}
        />
      );
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
      {renderValueSelector()}
    </CalciteBlock>
  );
}

export default FilterPanelExpression;
