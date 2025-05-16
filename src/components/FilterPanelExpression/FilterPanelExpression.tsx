import * as promiseUtils from '@arcgis/core/core/promiseUtils';
import {
  CalciteComboboxCustomEvent,
  CalciteInputCustomEvent,
  CalciteInputDatePickerCustomEvent,
  CalciteInputTimePickerCustomEvent,
  CalciteListCustomEvent,
  CalciteSelectCustomEvent
} from '@esri/calcite-components';
import { useCallback, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { toUTCDateString } from '../../utils';
import { FilterPanelLayer } from '../FilterPanel/FilterPanel';
import { FilterExpression, FilterOperator } from './types';
import { getOperators } from './utils';

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
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const filterPanelOperators = useMemo<FilterPanelOperatorItem[]>(() => {
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

  const updateUniqueValues = useCallback(
    async (where: string) => {
      const layer = props.layer;
      if (!layer) {
        // TODO: Handle error
        return;
      }
      const response = await layer.queryFeatures({
        where,
        num: 30,
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
            props.expression.operator === FilterOperator.DATE_INCLUDES ||
            props.expression.operator === FilterOperator.DATE_EXCLUDES
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
    },
    [props.expression, props.layer]
  );

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
      setIsDisabled(true);
      await updateUniqueValues('1=1');
      setIsDisabled(false);
    }
    props.onExpressionChange(expression);
  };
  const handleUniqueValuesFilterInput = useMemo(
    () =>
      promiseUtils.debounce(async (event: CalciteInputCustomEvent<void>) => {
        const value = event.target.value;
        await updateUniqueValues(
          `${props.expression.field.name} LIKE '%${value}%'`
        );
      }),
    [props.expression, updateUniqueValues]
  );

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
    const value = event.target.value;
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
          <calcite-button
            ref={setSelectValuesButtonRef}
            appearance="transparent"
            width="full"
            scale="s"
            className="mb-2.5"
            onClick={handleValuesOpenClick}
          >
            Select values
          </calcite-button>
          {uniqueValuePopoverOpen &&
            ReactDOM.createPortal(
              <calcite-popover
                label="Select values"
                referenceElement={selectValuesButtonRef || ''}
                placement="right-start"
              >
                <div className="w-[15rem]">
                  <calcite-input
                    type="search"
                    className="m-3"
                    icon="search"
                    oncalciteInputInput={handleUniqueValuesFilterInput}
                  />
                  <calcite-list
                    label="Unique values"
                    selectionMode="multiple"
                    oncalciteListChange={handleValuesChange}
                    className="max-h-[15rem] overflow-y-auto"
                    scale="s"
                  >
                    {uniqueValueOptions.map((option) => (
                      <calcite-list-item
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        selected={props.expression.values.includes(
                          option.value
                        )}
                      >
                        <div
                          slot="actions-end"
                          className="p-2 text-n2"
                        >
                          {option.count}
                        </div>
                      </calcite-list-item>
                    ))}
                  </calcite-list>
                  {exceededUniqueValuesTransferLimit && (
                    <div className="m-2.5 mb-1 text-n2">
                      Too many values to display.
                    </div>
                  )}
                  <div className="p-2">
                    <calcite-button
                      width="full"
                      scale="s"
                      onClick={handleValuesDoneClick}
                    >
                      Done
                    </calcite-button>
                  </div>
                </div>
              </calcite-popover>,
              document.body
            )}
          <calcite-list
            selectionMode="none"
            scale="s"
            label="Selected values"
          >
            {props.expression.values.map((value) => (
              <calcite-list-item
                key={value}
                label={value}
                value={value}
              >
                <calcite-action
                  slot="actions-end"
                  icon="x"
                  text=""
                  scale="s"
                  onClick={() => removeValuesItem(value)}
                />
              </calcite-list-item>
            ))}
          </calcite-list>
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
        <div className="mb-2.5 flex">
          <calcite-input-date-picker
            scale="s"
            value={props.expression.values[0]}
            className="flex-1"
            oncalciteInputDatePickerChange={handleDateValueChange}
          />
          <calcite-input-time-picker
            scale="s"
            value={props.expression.values[1]}
            step={1}
            className="flex-1"
            oncalciteInputTimePickerChange={handleTimeValueChange}
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
        <calcite-input
          label="Value"
          scale="s"
          className="mb-2.5"
          type={getInputType(props.expression.field)}
          value={props.expression.value}
          oncalciteInputInput={handleValueInput}
        />
      );
    }
  };

  return (
    <calcite-block
      heading="Expression"
      open
      disabled={isDisabled}
    >
      <calcite-dropdown
        slot="control"
        overlayPositioning="fixed"
        placement="bottom-end"
      >
        <calcite-action
          slot="trigger"
          icon="ellipsis"
          text=""
        />
        <calcite-action
          text="Delete"
          icon="trash"
          textEnabled
          onClick={handleDeleteClick}
        />
      </calcite-dropdown>
      <calcite-combobox
        label="Field"
        selectionMode="single-persist"
        scale="s"
        className="mb-2.5"
        clearDisabled
        ref={props.expression.fieldRef}
        value={props.expression.field.name}
        oncalciteComboboxChange={handleFieldChange}
      >
        {props.layer?.fields.map((field) => (
          <calcite-combobox-item
            key={field.name}
            value={field.name}
            heading={field.alias ?? ''}
            selected={field === props.expression.field}
            icon={getFieldIcon(field)}
          />
        ))}
      </calcite-combobox>
      <calcite-select
        label="Operator"
        scale="s"
        className="mb-2.5"
        value={props.expression.operator}
        oncalciteSelectChange={handleOperatorChange}
      >
        {filterPanelOperators
          .filter((operator) =>
            getOperators(props.expression.field).includes(operator.value)
          )
          .map((operator) => (
            <calcite-option
              key={operator.value}
              value={operator.value}
            >
              {operator.text}
            </calcite-option>
          ))}
      </calcite-select>
      {renderValueSelector()}
    </calcite-block>
  );
}

export default FilterPanelExpression;
