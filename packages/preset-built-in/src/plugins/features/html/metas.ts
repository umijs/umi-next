import { IApi } from '@umijs/types';

export default function(api: IApi, option) {
  // api.onOptionChange(newOption => {
  //   option = newOption;
  //   api.rebuildHTML();
  //   api.refreshBrowser();
  // });

  api.describe({
    key: 'metas',
  });

  (api as any).addHTMLMeta(() => {
    return option;
  });
}
