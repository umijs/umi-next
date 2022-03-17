import rollup from './rollup';

test('none config', () => {
  expect(rollup({}, {}).build).toEqual({
    rollupOptions: {
      plugins: [],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  });
});

test('config polyfill', () => {
  const obj = rollup({ polyfill: { imports: [] } }, {}).build.rollupOptions
    .plugins;
  expect(obj).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'polyfill' })]),
  );
});

test('config analyze', () => {
  const obj = rollup({ analyze: {} }, {}).build.rollupOptions.plugins;
  expect(obj).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'visualizer' })]),
  );
});

test('config copy', () => {
  const obj = rollup({ copy: [] }, {}).build.rollupOptions.plugins;
  expect(obj).toEqual(
    expect.arrayContaining([expect.objectContaining({ name: 'copy' })]),
  );
});

test('config hash', () => {
  const obj = rollup({ hash: false }, {}).build;
  expect(obj).toEqual({
    rollupOptions: {
      plugins: [],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  });
});
