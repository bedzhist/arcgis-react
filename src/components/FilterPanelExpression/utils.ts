import { FilterOperator } from './types';

export const getOperators = (field: __esri.Field) => {
  switch (field.type) {
    case 'string':
      return [
        FilterOperator.IS,
        FilterOperator.IS_NOT,
        FilterOperator.STARTS_WITH,
        FilterOperator.ENDS_WITH,
        FilterOperator.CONTAINS,
        FilterOperator.DOES_NOT_CONTAIN,
        FilterOperator.INCLUDES,
        FilterOperator.EXCLUDES,
        FilterOperator.IS_BLANK,
        FilterOperator.IS_NOT_BLANK,
        FilterOperator.IS_EMPTY_STRING,
        FilterOperator.IS_NOT_EMPTY_STRING
      ];
    case 'oid':
    case 'integer':
    case 'big-integer':
    case 'small-integer':
    case 'double':
      return [
        FilterOperator.EQUALS,
        FilterOperator.NOT_EQUALS,
        FilterOperator.INCLUDES,
        FilterOperator.EXCLUDES,
        FilterOperator.IS_AT_LEAST,
        FilterOperator.IS_LESS_THAN,
        FilterOperator.IS_AT_MOST,
        FilterOperator.IS_GREATER_THAN,
        FilterOperator.IS_BLANK,
        FilterOperator.IS_NOT_BLANK
      ];
    default:
      return [];
  }
};
