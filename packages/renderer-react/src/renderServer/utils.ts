import { lodash } from '@umijs/utils';

export const isPromise = (value: any): boolean =>
  lodash.isObject(value) && lodash.isFunction(value.then);
