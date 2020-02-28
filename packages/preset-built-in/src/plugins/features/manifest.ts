import { IApi } from '@umijs/types';

export default (api: IApi) => {
  api.describe({
    key: 'manifest',
    config: {
      schema(joi) {
        return joi.object({
          fileName: joi.string().optional(),
          publicPath: joi.string().optional(),
          basePath: joi.string().optional(),
        });
      },
    },
  });
};
