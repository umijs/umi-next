import type { IApi } from 'umi';
// @ts-ignore
import vuePlugin from '../../../compiled/@vitejs/plugin-vue';
// @ts-ignore
import vueJsxPlugin from '../../../compiled/@vitejs/plugin-vue-jsx';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:vite',
  });

  api.registerPlugins([
    {
      id: `virtual: config-vuejsx`,
      key: 'vueJsx',
      config: {
        schema(joi) {
          return joi.object();
        },
      },
    },
  ]);

  api.modifyViteConfig((config) => {
    config.plugins?.push(vuePlugin(api.config.vue));
    config.plugins?.push(vueJsxPlugin(api.config.vueJsx));
    return config;
  });
};
