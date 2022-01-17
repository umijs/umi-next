import { IApi } from 'umi';

export default function (api: IApi) {
  // disable if routes if configured
  if (api.userConfig.routes) return;

  api.describe({
    key: 'conventionRoutes',
    config: {
      schema(Joi) {
        return Joi.object({
          excludes: Joi.array().items(
            Joi.alternatives(Joi.string(), Joi.any()),
          ),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyRoutes((memo) => {
    const { conventionRoutes = {} } = api.config;
    const { excludes = [] } = conventionRoutes;
    if (excludes.length === 0) return memo;
    Object.keys(memo).forEach((id) => {
      const route = memo[id];
      for (const exclude of excludes) {
        if (
          route.file &&
          !route.file.startsWith('() =>') &&
          exclude instanceof RegExp &&
          exclude.test(route.file)
        ) {
          delete memo[id];
          return;
        }
      }
    });
    return memo;
  });
}
