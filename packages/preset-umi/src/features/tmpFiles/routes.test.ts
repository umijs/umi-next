import { join } from 'path';
import { getRoutes } from './routes';

const fixtures = join(__dirname, './fixtures/getRoutes');

test('getRoutes', async () => {
  const routes = await getRoutes({
    api: {
      paths: {
        absSrcPath: fixtures,
        absPagesPath: join(fixtures, 'pages'),
      },
      config: {
        routes: [
          {
            id: 'login',
            path: '/login',
            layout: false,
            component: 'users/Login',
          },
          {
            path: '*',
            component: '404',
          },
          {
            path: '/hello',
            component: '@/pages/Hello',
          },
          {
            path: '/users',
            component: '@/pages/Users/index.vue',
            routes: [
              {
                path: '/users/foo',
                component: './users/Foo',
              },
            ],
          },
        ],
      },
      applyPlugins(opts: any) {
        return opts?.initialValue;
      },
    } as any,
  });

  expect(routes[1].file).toBe('@/pages/users/Login/index.tsx');
  expect(routes[1].parentId).toBe(undefined);

  // __absFile 是具体的路径, 快照测试通不过
  Object.keys(routes).forEach((id) => {
    delete routes[id].__absFile;
  });

  expect(routes).toMatchSnapshot();
});
