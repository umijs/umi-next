import { IApi } from '@umijs/types';
import getScripts, { ScriptConfig } from '../utils/getScripts';

export default function(api: IApi, option: ScriptConfig) {
  // api.onOptionChange(newOption => {
  //   option = newOption;
  //   api.rebuildHTML();
  //   api.refreshBrowser();
  // });

  api.describe({
    key: 'scripts',
  });

  api.addHTMLScript(() => {
    return getScripts(option);
  });
}
