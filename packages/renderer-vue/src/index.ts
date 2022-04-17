// @ts-ignore
import { RouterOptions } from 'vue-router';

// @ts-ignore
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
// @ts-ignore
} from 'vue-router';
export { useAppData } from './appContext';
export { renderClient } from './browser';

export type RouterConfig = Omit<RouterOptions, 'history' | 'routes'>;
