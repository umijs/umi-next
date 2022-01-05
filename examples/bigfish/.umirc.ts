export default {
  routes: [
    {
      title: 'site.title',
      path: '/',
      icon: 'PlaySquareFilled',
      component: 'index',
      name: 'index',
    },
    { path: '/users', icon: 'SmileFilled', component: 'users', name: 'users' },
    { path: '/app1', icon: 'SmileFilled', name: 'app1', microApp: 'app1' },
    {
      path: '/data-flow',
      component: 'data-flow',
      name: 'data-flow',
      icon: 'StarFilled',
      routes: [
        {
          path: '/data-flow/use-model',
          component: 'use-model',
          name: 'use-model',
          icon: 'SwitcherFilled',
        },
        {
          path: '/data-flow/dva',
          component: 'dva',
          name: 'dva',
          icon: 'TagFilled',
        },
      ],
    },
  ],
  antd: {
    // import: true,
    style: 'less',
    // dark: true,
  },
  initialState: {},
  access: {},
  dva: {},
  model: {},
  analytics: {
    baidu: 'test',
  },
  moment2dayjs: {},
  layout: {
    name: 'Ant Design Pro',
  },
  mfsu: {},
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
        },
      ],
    },
  },
  lowImport: {},
};
