import extraConfig from './extraConfig';

export default {
  base: '/foo',
  // history: { type: 'hash' },
  routes: [
    { path: '/', component: 'index' },
    { path: '/users', component: 'users' },
    {
      path: '/users/:id',
      component: 'users/$id',
      wrappers: ['@/wrappers/foo', '@/wrappers/bar'],
    },
    {
      path: '/about',
      component: 'about',
    },
    {
      path: '/class-component',
      component: 'class-component',
    },
    {
      path: '*',
      component: '@/components/404',
    },
  ],
  externals: {
    marked: [
      'script https://gw.alipayobjects.com/os/lib/marked/2.0.0/marked.min.js',
      'marked',
    ],
    '@antv/g2': [
      'script https://gw.alipayobjects.com/os/lib/antv/g2/3.5.19/dist/g2.min.js',
      'G2',
    ],
    '@antv/g6': [
      'script https://gw.alipayobjects.com/os/lib/antv/g6/4.1.16/dist/g6.min.js',
      'G6',
    ],
  },
  chainWebpack(memo: any) {
    memo;
  },
  mfsu: {
    esbuild: true,
  },
  // vite: {},
  deadCode: {},
  https: {},
  // fastRefresh: false,
  // favicon: 'https://sivers.com/favicon.ico',
  headScripts: [`console.log('head script')`],
  // scripts: [`console.log('script')`],
  npmClient: 'pnpm',
  svgr: {},
  crossorigin: {},
  // srcTranspiler: 'swc',
  // esmi: {},
  // esm: {},
  lowImport: false,
  title: 'boilerplate - umi 4',
  ...extraConfig,
};
