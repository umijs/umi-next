import { IApi } from '@umijs/types';
import { Route } from '@umijs/core';

export default function(api: IApi) {
  api.describe({
    key: 'routes',
    config: {
      schema(joi) {
        return joi.array().items(joi.object());
      },
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  api.registerMethod({
    name: 'getRoutes',
    async fn() {
      const route = new Route({
        async onPatchRoutes(args: object) {
          await api.applyPlugins({
            key: 'onPatchRoutes',
            type: api.ApplyPluginsType.event,
            args,
          });
        },
        async onPatchRoute(args: object) {
          await api.applyPlugins({
            key: 'onPatchRoute',
            type: api.ApplyPluginsType.event,
            args,
          });
        },
      });
      return route.getRoutes({
        config: api.config,
        root: api.paths.absPagesPath!,
      });
    },
  });
}
