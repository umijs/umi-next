// import { config, } from '../../../../preset-umi/node_modules/@umijs/bundler-webpack/compiled/webpack/types';
import target from './target';

test('target filter_1', () => {
  expect(target({ targets: { chrome: 80, edge: 11 } }, {}).build).toEqual({
    target: ['chrome80', 'edge11'],
  });
});

test('target filter_2', () => {
  expect(target({ targets: { chrome: 80, ie: 11 } }, {}).build).toEqual({
    target: ['chrome80'],
  });
});

test('noneTarget - config', () => {
  expect(target({ targets: {} }, {})).toEqual({
    build: { target: [] },
    plugins: [],
  });
});

test('only new browser - config', () => {
  expect(target({ targets: { chrome: 80 } }, {})).toEqual({
    build: { target: ['chrome80'] },
    plugins: [],
  });
});

test('old browser - config', () => {
  const obj = target({ targets: { ie: 11 } }, {}).plugins[0];
  expect(obj).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'vite:legacy-config' }),
      expect.objectContaining({ name: 'vite:legacy-generate-polyfill-chunk' }),
      expect.objectContaining({ name: 'vite:legacy-post-process' }),
      expect.objectContaining({ name: 'vite:legacy-env' }),
    ]),
  );
});
