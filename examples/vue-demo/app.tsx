import { RouterConfig } from 'umi';

export function onRouterCreated({ router }: any) {
  console.log('onRouterCreated', router);
}

export function onAppCreated({ app }: any) {
  console.log('onAppCreated', app);
}

export function onMounted({ app, router }: any) {
  console.log('onMounted', app, router);
}

export const router: RouterConfig = {
  scrollBehavior(to, from) {
    console.log('scrollBehavior', to, from);
  },
};
