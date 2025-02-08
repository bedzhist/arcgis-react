export enum FilterOperator {
  IS = 'IS',
  IS_NOT = 'IS_NOT',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS'
}

export interface FilterExpression {
  id: string;
  fieldRef: React.RefObject<HTMLCalciteComboboxElement | null>;
  field: __esri.Field;
  operator: FilterOperator;
  value: string;
}
