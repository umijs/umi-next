import { isPromise } from './utils';

describe('renderServer-utils', () => {
  it('isPromise', () => {
    expect(isPromise(Promise.resolve({ id: 1 }))).toBeTruthy();
    expect(isPromise(Promise.reject({ id: 1 }).catch(() => {}))).toBeTruthy();
    expect(isPromise(() => {})).toBeFalsy();
    expect(isPromise(() => Promise.resolve({ id: 1 }))).toBeFalsy();
  });
});
