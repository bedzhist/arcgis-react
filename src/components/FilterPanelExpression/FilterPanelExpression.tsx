import {
  CalciteComboboxCustomEvent,
  CalciteInputCustomEvent,
  CalciteSelectCustomEvent,
  CalciteListCustomEvent
} from '@esri/calcite-components';
import {
  CalciteAction,
  CalciteBlock,
  CalciteButton,
  CalciteCombobox,
  CalciteComboboxItem,
  CalciteDropdown,
  CalciteInput,
  CalciteList,
  CalciteListItem,
  CalciteOption,
  CalcitePopover,
  CalciteSelect
} from '@esri/calcite-components-react';
import { useMemo, useRef, useState } from 'react';
import { FilterPanelLayer } from '../FilterPanel/FilterPanel';
import { FilterExpression, FilterOperator } from './types';
import { getOperators } from './utils';
import ReactDOM from 'react-dom';

interface FilterPanelOperatorItem {
  value: FilterOperator;
  text: string;
}

interface FilterPanelExpressionValueOption {
  label: string;
  count: number;
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
  onValuesChange: (
    event: CalciteListCustomEvent<void>,
    expression: FilterExpression
  ) => void;
  onValuesRemove: (value: string, expression: FilterExpression) => void;
}

export function FilterPanelExpression(props: FilterPanelExpressionProps) {
  const selectValuesPopoverRef = useRef<HTMLCalcitePopoverElement>(null);

  const [selectValuesButtonRef, setSelectValuesButtonRef] =
    useState<HTMLCalciteButtonElement | null>(null);
  const [uniqueValueOptions, setValueOptions] = useState<
    FilterPanelExpressionValueOption[]
  >([]);
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
      { value: FilterOperator.INCLUDES, text: 'includes' },
      { value: FilterOperator.EXCLUDES, text: 'excludes' },
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
    props.onFieldChange(event, props.expression);
  };
  const handleOperatorChange = async (
    event: CalciteSelectCustomEvent<void>
  ) => {
    const layer = props.layer;
    if (!layer) {
      // TODO: Handle error
      return;
    }
    props.onOperatorChange(event, props.expression);
    const value = event.target.value as FilterOperator;
    if (
      value === FilterOperator.INCLUDES ||
      value === FilterOperator.EXCLUDES
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
      setValueOptions(
        features.map((feature) => ({
          label: feature.attributes[props.expression.field.name],
          count: feature.attributes['count']
        }))
      );
    }
  };
  const handleValueInput = (event: CalciteInputCustomEvent<void>) => {
    props.onValueChange(event, props.expression);
  };
  const handleValuesChange = (event: CalciteListCustomEvent<void>) => {
    props.onValuesChange(event, props.expression);
  };
  const handleValuesDoneClick = () => {
    const selectValuesPopoverEl = selectValuesPopoverRef.current;
    if (!selectValuesPopoverEl) {
      // TODO: Handle error
      return;
    }
    selectValuesPopoverEl.open = false;
  };

  const removeValuesItem = (value: string) => {
    props.onValuesRemove(value, props.expression);
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
      {props.expression.operator === FilterOperator.INCLUDES ||
      props.expression.operator === FilterOperator.EXCLUDES ? (
        <>
          <CalciteButton
            ref={setSelectValuesButtonRef}
            appearance="transparent"
            width="full"
            scale="s"
            className="mb-4"
          >
            Select values
          </CalciteButton>
          {ReactDOM.createPortal(
            <CalcitePopover
              ref={selectValuesPopoverRef}
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
                      key={option.label}
                      label={option.label}
                      value={option.label}
                      selected={props.expression.values.includes(option.label)}
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
                  <div className="m-4 text-2">Too many values to display.</div>
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
      ) : props.expression.operator !== FilterOperator.IS_BLANK &&
        props.expression.operator !== FilterOperator.IS_NOT_BLANK &&
        props.expression.operator !== FilterOperator.IS_EMPTY_STRING &&
        props.expression.operator !== FilterOperator.IS_NOT_EMPTY_STRING ? (
        <CalciteInput
          label="Value"
          scale="s"
          className="mb-4"
          type={getInputType(props.expression.field)}
          value={props.expression.value}
          onCalciteInputInput={handleValueInput}
        />
      ) : null}
    </CalciteBlock>
  );
}

export default FilterPanelExpression;
