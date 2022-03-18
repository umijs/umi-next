import IConfigProcessor from './optimizeDeps';

test('optimizeDeps config', () => {
  const obj = IConfigProcessor(
    { alias: { node_modules: 'omg' }, entry: {} },
    {},
  ).optimizeDeps;
  expect(obj).toEqual(
    expect.objectContaining({
      entries: [],
      include: [],
    }),
  );
});
test('none alias config', () => {
  const obj = IConfigProcessor({ entry: {} }, {}).optimizeDeps;
  expect(obj).toEqual(
    expect.objectContaining({
      entries: [],
    }),
  );
});
