import { IApi } from '@umijs/types';

export default function(api: IApi) {
  console.log('html', api);
  api.describe({
    key: 'headScripts',
    config: {
      schema(joi) {
        return joi.array().items(joi.object());
      },
    },
  });
}
