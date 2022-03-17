import css from './css';

test('css getBrowserlist', () => {
  const arr = css({ targets: { chrome: 80, edge: 11 } }, {}).css?.postcss
    .plugins[0].plugins;
  expect.arrayContaining([
    expect.objectContaining({ browsers: ['chrome >= 80', 'ie >= 11'] }),
  ]);
});
