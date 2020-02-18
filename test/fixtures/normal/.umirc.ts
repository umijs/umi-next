import { defineConfig } from 'umi';

export default defineConfig({
  routes: [
    {
      path: '/',
      component: '../layout/layout',
      routes: [
        { path: '/bar', component: './bar' },
        { path: '/', component: './index' },
      ]
    },
  ],
  define: {
    UMI_DEFINE: 'test'
  }
})
