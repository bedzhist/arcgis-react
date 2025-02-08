import { FilterOperator } from './types';

export const getOperators = (field: __esri.Field) => {
  switch (field.type) {
    case 'string':
      return [
        FilterOperator.IS,
        FilterOperator.IS_NOT,
        FilterOperator.CONTAINS
      ];
    case 'oid':
    case 'integer':
    case 'big-integer':
    case 'small-integer':
      return [FilterOperator.EQUALS, FilterOperator.NOT_EQUALS];
    default:
      return [];
  }
};
