import { lodash } from '@umijs/utils';

export const isPromise = (value: any): boolean =>
  typeof value === 'object' && lodash.isFunction(value.then);
