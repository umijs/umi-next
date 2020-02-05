import { IApi } from '@umijs/types';

export default function(api: IApi) {
  api.describe({
    key: 'metas',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  api.addHTMLMeta(() => {
    return api.config?.metas || [];
  });
}
