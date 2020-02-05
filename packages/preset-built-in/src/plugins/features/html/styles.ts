import { IApi } from '@umijs/types';

export default function(api: IApi) {
  api.describe({
    key: 'styles',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  api.addHTMLStyle(() => {
    return api.config?.styles || [];
  });
}
