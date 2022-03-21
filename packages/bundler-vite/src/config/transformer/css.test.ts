import css from './css';

test('css getBrowserlist', () => {
  const plugins = css({ targets: { chrome: 80, edge: 11 } }, {}).css!.postcss
    .plugins[0].plugins;
  expect.arrayContaining([
    expect.objectContaining({ browsers: ['chrome >= 80', 'ie >= 11'] }),
  ]);
});

test('postcssOptions', () => {
  const postcss = css(
    {
      postcssLoader: {
        postcssOptions: { postcss: 'option' },
      },
    },
    {},
  ).css!.postcss;
  expect.objectContaining({
    postcss: 'option',
  });
  const plugins = css(
    {
      postcssLoader: {
        postcssOptions: { postcss: 'option' },
      },
    },
    {},
  ).css!.postcss.plugins;
  expect.arrayContaining([]);
});

test('autoprefixer', () => {
  const plugins = css({ autoprefixer: { prefixer: 'auto' } }, {}).css?.postcss
    .plugins[0].plugins;
  expect.arrayContaining([
    expect.objectContaining({ flexbox: 'no-2009' }),
    expect.objectContaining({ prefixer: 'auto' }),
  ]);
});

test('extraPostCSSPlugins plugins', () => {
  const plugins = css({ extraPostCSSPlugins: ['Plugins_1', 'Plugins_2'] }, {})
    .css!.postcss.plugins;
  expect.arrayContaining(['Plugins_1', 'Plugins_2']);
});

test('lessOptions', () => {
  const less = css(
    {
      lessLoader: {
        lessOptions: {
          Options: 'less',
        },
      },
      theme: {
        custom: 'usertheme',
      },
    },
    {},
  ).css!.preprocessorOptions!.less;
  expect.objectContaining({
    javascriptEnabled: true,
    Options: less,
    custom: 'usertheme',
  });
});

test('theme', () => {
  const less = css(
    {
      theme: {
        custom: 'usertheme',
      },
    },
    {},
  ).css!.preprocessorOptions!.less;
  expect.objectContaining({
    javascriptEnabled: true,
    custom: 'usertheme',
  });
});
