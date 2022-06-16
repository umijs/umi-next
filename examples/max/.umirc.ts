import { defineConfig } from '@umijs/max';

export default defineConfig({
  routes: [
    {
      title: 'site.title',
      path: '/',
      icon: 'PlaySquareFilled',
      component: 'index',
      name: 'index',
      wrappers: ['@/wrappers/redWrapper', '@/wrappers/greenWrapper'],
    },
    { path: '/users', icon: 'SmileFilled', component: 'users', name: 'users' },
    { path: '/app1/*', icon: 'SmileFilled', name: 'app1', microApp: 'app1' },
    {
      path: '/data-flow',
      component: 'data-flow',
      name: 'data-flow',
      icon: 'SmileFilled',
      routes: [
        {
          path: '/data-flow/use-model',
          component: 'use-model',
          name: 'use-model',
          icon: 'SwitcherFilled',
          wrappers: ['@/wrappers/greenWrapper', '@/wrappers/redWrapper'],
        },
        {
          path: '/data-flow/dva',
          component: 'dva',
          name: 'dva',
          icon: 'TagFilled',
          wrappers: ['@/wrappers/greenWrapper'],
        },
      ],
    },
  ],
  antd: {
    import: true,
    style: 'less',
    // dark: true,
  },
  initialState: {
    loading: '@/components/Loading',
  },
  access: {},
  dva: {},
  model: {},
  analytics: {
    baidu: 'test',
  },
  moment2dayjs: {},
  mock: {
    include: ['pages/**/_mock.ts'],
  },
  layout: {
    title: 'Ant Design Pro',
  },
  mfsu: {
    esbuild: true,
  },
  request: {},
  locale: {
    title: true,
  },
  qiankun: {
    master: {
      apps: [
        {
          name: 'app1',
          entry: '//localhost:8001/app1',
          props: {
            autoSetLoading: true,
          },
        },
      ],
    },
  },
  // vite: {}
  // esmi: { cdnOrigin: 'https://npmcore-pre.alipay.com' },
  // lowImport: {},
});
