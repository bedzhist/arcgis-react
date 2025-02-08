export enum FilterOperator {
  IS = 'IS',
  IS_NOT = 'IS_NOT',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  IS_AT_LEAST = 'IS_AT_LEAST',
  IS_LESS_THAN = 'IS_LESS_THAN',
  IS_AT_MOST = 'IS_AT_MOST',
  IS_GREATER_THAN = 'IS_GREATER_THAN',
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  INCLUDES = 'INCLUDES',
  EXCLUDES = 'EXCLUDES',
  IS_BLANK = 'IS_BLANK',
  IS_NOT_BLANK = 'IS_NOT_BLANK',
  IS_EMPTY_STRING = 'IS_EMPTY_STRING',
  IS_NOT_EMPTY_STRING = 'IS_NOT_EMPTY_STRING'
}

export interface FilterExpression {
  id: string;
  fieldRef: React.RefObject<HTMLCalciteComboboxElement | null>;
  field: __esri.Field;
  operator: FilterOperator;
  value: string;
  values: string[];
}
