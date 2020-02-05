import { IApi } from '@umijs/types';

export default function(api: IApi) {
  // api.onOptionChange(newOption => {
  //   option = newOption;
  //   api.rebuildHTML();
  //   api.refreshBrowser();
  // });

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
