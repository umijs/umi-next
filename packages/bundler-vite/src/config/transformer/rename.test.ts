import rename from './rename';

test('single layer rename ', () => {
  expect(rename({ publicPath: '/rename/publicPath' }, {})).toEqual({
    base: '/rename/publicPath',
  });
});

test('multilayer rename', () => {
  expect(
    rename(
      {
        jsMinifier: '/rename/jsMinifier',
        jsMinifierOptions: '/rename/jsMinifierOptions',
      },
      {},
    ).build,
  ).toEqual(
    expect.objectContaining({
      minify: '/rename/jsMinifier',
      terserOptions: '/rename/jsMinifierOptions',
    }),
  );
});
