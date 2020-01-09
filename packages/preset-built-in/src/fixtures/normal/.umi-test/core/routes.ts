import { ApplyPluginsType } from '/Users/jcl/github/umi/umi-next/packages/runtime/dist/index.js';
import { plugin } from '@/.umi-test/core/umiExports';

const routes = [
  {
    "path": "/",
    "exact": true,
    "component": require('@/pages/index.tsx').default
  },
  {
    "path": "/users",
    "exact": true,
    "component": require('@/pages/users.tsx').default
  }
];

// allow user to extend routes
plugin.applyPlugins({
  key: 'patchRoutes',
  type: ApplyPluginsType.event,
  args: { routes },
});

export { routes };
