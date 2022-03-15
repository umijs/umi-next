import { join } from 'path';
import { getConventionRoutes } from './routesConvention';

const fixtures = join(__dirname, '../../fixtures/route');

test('normal', () => {
  expect(
    getConventionRoutes({
      base: join(fixtures, 'convention-a/pages'),
    }),
  ).toEqual({
    a: {
      path: 'a',
      id: 'a',
      parentId: undefined,
      file: 'a.ts',
    },
    b: {
      path: 'b',
      id: 'b',
      parentId: undefined,
      file: 'b.ts',
    },
    'b/c': {
      path: 'c',
      id: 'b/c',
      parentId: 'b',
      file: 'b/c.ts',
    },
    d: {
      path: 'd',
      id: 'd',
      parentId: undefined,
      file: 'd.ts',
    },
  });
});

test('exclude', () => {
  expect(
    getConventionRoutes({
      base: join(fixtures, 'convention-a/pages'),
      exclude: [/b\.(j|t)sx?$/, /b\//],
    }),
  ).toEqual({
    a: {
      path: 'a',
      id: 'a',
      parentId: undefined,
      file: 'a.ts',
    },
    d: {
      path: 'd',
      id: 'd',
      parentId: undefined,
      file: 'd.ts',
    },
  });
});

test('index/index', () => {
  expect(
    getConventionRoutes({
      base: join(fixtures, 'convention-b/pages'),
    }),
  ).toEqual({
    'index/index': {
      path: '/',
      id: 'index/index',
      parentId: undefined,
      file: 'index/index.ts',
    },
  });
});

test('index and index/index ', () => {
  expect(
    getConventionRoutes({
      base: join(fixtures, 'convention-c/pages'),
    }),
  ).toEqual({
    'index/index': {
      path: '/',
      id: 'index/index',
      parentId: 'index',
      file: 'index/index.ts',
    },
    index: {
      path: '/',
      id: 'index',
      parentId: undefined,
      file: 'index.ts',
    },
  });
});
