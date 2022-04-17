import { dirname } from 'path';
import type { IApi } from 'umi';
import { resolveProjectDep } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    key: 'vue',
    config: {
      schema(joi) {
        return joi.object();
      },
      onChange: api.ConfigChangeType.reload,
    },
  });

  const vuePath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'vue/dist/vue.esm-bundler.js',
    }) || require.resolve('vue/dist/vue.esm-bundler.js');

  const vueRuntimePath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'vue/dist/vue.runtime.esm-bundler.js',
    }) || require.resolve('vue/dist/vue.runtime.esm-bundler.js');

  api.modifyDefaultConfig((config) => {
    config.alias = {
      ...config.alias,
      vue$: api.userConfig.vue?.runtimeCompiler ? vuePath : vueRuntimePath,
      'vue-router':
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'vue-router',
        }) || dirname(require.resolve('vue-router/package.json')),
    };

    // feature flags https://link.vuejs.org/feature-flags.
    config.define = {
      ...config.define,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    };

    return config;
  });

  api.modifyConfig((memo) => {
    // react 独有配置需要禁用
    memo.fastRefresh = false;
    return memo;
  });

  api.modifyRendererPath(() =>
    dirname(require.resolve('@umijs/renderer-vue/package.json')),
  );

  // 增加运行时key
  api.addRuntimePluginKey(() => [
    'router',
    'onRouterCreated',
    'onAppCreated',
    'onMounted',
  ]);

  // const babelPresets = [
  //   require.resolve('@ksuni/babel-preset-vue'),
  //   {
  //     presetEnv: {},
  //     presetTypeScript: {},
  //     pluginTransformRuntime: {},
  //     pluginLockCoreJS: {},
  //     pluginDynamicImportNode: false,
  //     pluginAutoCSSModules: false,
  //   },
  // ];

  // 处理mfsu
  // api.modifyConfig((memo) => {
  //   // 处理 vue 框架 node_modules 中 tsx 文件编译
  //   const enableMFSU = api.config.mfsu !== false;

  //   if (enableMFSU) {
  //     memo.mfsu = {
  //       chainWebpack(config: any) {
  //         config.module
  //           .rule('jsx-ts-tsx')
  //           .use('babel-loader')
  //           .tap((options: any) => {
  //             options.presets = [babelPresets];
  //             return options;
  //           });

  //         return config;
  //       },
  //       ...(api.config.mfsu || {}),
  //     };
  //   }

  //   return memo;
  // });
};
