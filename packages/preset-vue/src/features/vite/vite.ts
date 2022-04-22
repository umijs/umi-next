import vuePlugin from '@vitejs/plugin-vue';
import type { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:vite',
  });

  // TODO 现在无法感知插件是否注册, 所有注册一个虚拟的id 用于判断 vue插件注册
  api.registerPlugins([
    {
      id: `virtual:preset-vue`,
      key: 'virtual:preset-vue',
      config: {
        schema: (joi) => joi.object(),
      },
    },
  ]);

  api.chainWebpack((config) => {
    return config;
  });

  api.modifyConfig((memo) => {
    memo.svgr = false;
    memo.react = false;
    return memo;
  });

  api.modifyViteConfig((config) => {
    config.plugins?.push(vuePlugin(api.config.vue));
    return config;
  });
};
