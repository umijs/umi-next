import vuePlugin from '@vitejs/plugin-vue';
import type { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:vite',
  });

  api.modifyViteConfig((config) => {
    config.plugins?.push(vuePlugin(api.config.vue));
    return config;
  });
};
