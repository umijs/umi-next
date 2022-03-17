import rename from './rename';

test('rename publicPath', () => {
  expect(rename({ publicPath: '/rename/publicPath' }, {})).toEqual({
    base: '/rename/publicPath',
  });
});

test('rename extraVitePlugins', () => {
  expect(rename({ extraVitePlugins: '/rename/extraVitePlugins' }, {})).toEqual({
    plugins: '/rename/extraVitePlugins',
  });
});

test('rename jsMinifier and jsMinifierOptions', () => {
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
