// @ts-nocheck

// `xtest` is `test.skip` alias in jest, but vitest does not have `xtest`
if (!global.xtest) {
  global.xtest = test.skip;
}

// support `jest.fn` <=> `vi.fn`
if (!global.jest) {
  global.jest = vi;
}
