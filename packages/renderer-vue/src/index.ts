// @ts-ignore
import { RouterOptions } from 'vue-router';

export {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  RouterLink,
  RouterView,
  useLink,
  useRoute,
  useRouter,
} from 'vue-router';
export { useAppData } from './appContext';
export { renderClient } from './browser';

export type RouterConfig = Omit<RouterOptions, 'history' | 'routes'>;
