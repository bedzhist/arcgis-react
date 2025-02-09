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
        FilterOperator.STRING_INCLUDES,
        FilterOperator.STRING_EXCLUDES,
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
        FilterOperator.NUMBER_INCLUDES,
        FilterOperator.NUMBER_EXCLUDES,
        FilterOperator.IS_AT_LEAST,
        FilterOperator.IS_LESS_THAN,
        FilterOperator.IS_AT_MOST,
        FilterOperator.IS_GREATER_THAN,
        FilterOperator.IS_BLANK,
        FilterOperator.IS_NOT_BLANK
      ];
    case 'date':
      return [
        FilterOperator.IS_ON,
        FilterOperator.IS_NOT_ON,
        FilterOperator.IS_BEFORE,
        FilterOperator.IS_AFTER,
        FilterOperator.IS_BEFORE_OR_EQUAL_TO,
        FilterOperator.IS_AFTER_OR_EQUAL_TO,
        FilterOperator.DATE_INCLUDES,
        FilterOperator.DATE_EXCLUDES,
        FilterOperator.IS_BLANK,
        FilterOperator.IS_NOT_BLANK
      ];
    default:
      return [];
  }
};
