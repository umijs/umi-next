import { PluginAPI } from './pluginAPI';

export default (api: PluginAPI) => {
  [
    'onCheck',
    'onStart',
    'modifyAppData',
    'modifyConfig',
    'modifyDefaultConfig',
    'modifyPaths',
  ].forEach((name) => {
    api.registerMethod({ name });
  });
};
