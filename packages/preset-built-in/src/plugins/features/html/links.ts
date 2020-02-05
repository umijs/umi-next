import { IApi } from '@umijs/types';

export default function(api: IApi) {
  api.describe({
    key: 'links',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  api.addHTMLLink(() => {
    return api.config?.links || [];
  });
}
