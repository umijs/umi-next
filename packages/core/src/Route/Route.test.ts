import { join } from 'path';
import Route from './Route';

const fixtures = join(__dirname, 'fixtures');

test('config empty', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: { routes: [] },
      root: '/tmp',
    }),
  ).toEqual([]);
});

test('config pro', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {
        routes: [
          {
            path: '/user',
            component: '../layouts/UserLayout',
            routes: [
              {
                path: '/user/login',
                component: './user/login',
              },
            ],
          },
          {
            path: '/',
            component: '../layouts/SecurityLayout',
            routes: [
              {
                path: '/',
                component: '../layouts/BasicLayout',
                routes: [
                  {
                    path: '/',
                    redirect: '/welcome',
                  },
                  {
                    path: '/welcome',
                    component: './Welcome',
                  },
                  {
                    path: '/admin',
                    component: './Admin',
                    routes: [
                      {
                        path: '/admin/sub-page',
                        component: './Welcome',
                      },
                    ],
                  },
                  {
                    path: '/list',
                    component: './ListTableList',
                  },
                  { component: './404' },
                ],
              },
              { component: './404' },
            ],
          },
          { component: './404' },
        ],
      },
      root: '/tmp',
    }),
  ).toEqual([
    {
      path: '/user',
      component: '/layouts/UserLayout',
      routes: [
        {
          path: '/user/login',
          component: '/tmp/user/login',
        },
      ],
    },
    {
      path: '/',
      component: '/layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '/layouts/BasicLayout',
          routes: [
            {
              path: '/',
              redirect: '/welcome',
            },
            {
              path: '/welcome',
              component: '/tmp/Welcome',
            },
            {
              path: '/admin',
              component: '/tmp/Admin',
              routes: [
                {
                  path: '/admin/sub-page',
                  component: '/tmp/Welcome',
                },
              ],
            },
            {
              path: '/list',
              component: '/tmp/ListTableList',
            },
            {
              component: '/tmp/404',
            },
          ],
        },
        {
          component: '/tmp/404',
        },
      ],
    },
    {
      component: '/tmp/404',
    },
  ]);
});

test('conventional normal', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {},
      root: join(fixtures, 'conventional-normal/pages'),
    }),
  ).toEqual([
    {
      path: '/',
      component: '@/layouts/index.ts',
      routes: [
        {
          path: '/',
          exact: true,
          component: '@/pages/index.ts',
        },
        {
          path: '/users',
          routes: [
            {
              path: '/users/:userId',
              exact: true,
              component: '@/pages/users/[userId].ts',
            },
          ],
          component: '@/pages/users/_layout.ts',
        },
        {
          path: '/:post/comments',
          exact: true,
          component: '@/pages/[post]/comments.ts',
        },
        {
          path: '/:post',
          exact: true,
          component: '@/pages/[post]/index.ts',
        },
      ],
    },
  ]);
});

test('conventional index/index', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {},
      root: join(fixtures, 'conventional-index-index/pages'),
    }),
  ).toEqual([
    {
      path: '/',
      exact: true,
      component: '@/pages/index/index.ts',
    },
  ]);
});

test('conventional opts.componentPrefix', async () => {
  const route = new Route();
  expect(
    await route.getRoutes({
      config: {},
      root: join(fixtures, 'conventional-opts/pages'),
      componentPrefix: '@@@/',
    }),
  ).toEqual([
    {
      path: '/',
      exact: true,
      component: '@@@/pages/index.ts',
    },
  ]);
});

test('getJSON()', () => {
  const route = new Route();
  expect(
    route.getJSON({
      routes: [{ component: '@/foo' }],
    }),
  ).toEqual(
    `
[
  {
    "component": require('@/foo').default
  }
]
  `.trim(),
  );
});

test('getPaths()', () => {
  const route = new Route();
  expect(
    route.getPaths({
      routes: [
        {
          path: '/',
          routes: [{ path: '/' }, { path: '/bar' }, { path: '/:foo' }],
        },
        { path: '/foo' },
        { component: '@/pages/foo' },
      ],
    }),
  ).toEqual(['/', '/bar', '/:foo', '/foo']);
});
