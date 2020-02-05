import { IApi } from '@umijs/types';
import { getScripts } from './utils';

export default function(api: IApi) {
  // api.onOptionChange(newOption => {
  //   option = newOption;
  //   api.rebuildHTML();
  //   api.refreshBrowser();
  // });

  api.describe({
    key: 'scripts',
    config: {
      schema(joi) {
        return joi.array();
      },
    },
  });

  api.addHTMLScript(() => {
    return getScripts(api.config?.scripts || []);
  });
}
