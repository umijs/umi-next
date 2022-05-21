import type Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import type { IApi } from 'umi';
import { getConfig } from './config/config';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:webpack',
  });

  api.chainWebpack((config) => {
    getConfig(config, api);
    return config;
  });

  api.modifyConfig((memo) => {
    // 处理 mfsu 包含vue 模块的依赖处理
    const enableMFSU = memo.mfsu !== false;
    if (enableMFSU) {
      memo.mfsu = {
        ...(memo.mfsu || {}),
        chainWebpack(config: Config) {
          getConfig(config, api);

          // 处理 vue 框架 node_modules 中 tsx, jsx 文件编译
          config.module
            .rule('jsx-ts-tsx')
            .use('babel-loader')
            .tap((options) => {
              const babelPreset = [
                require.resolve('@umijs/babel-preset-umi'),
                {
                  presetEnv: {},
                  // vue 需要禁用 presetReact
                  presetReact: false,
                  presetTypeScript: {},
                  pluginTransformRuntime: {},
                  pluginLockCoreJS: {},
                  pluginDynamicImportNode: false,
                  pluginAutoCSSModules: api.config.autoCSSModules,
                },
              ];

              options.presets = [babelPreset];
              options.plugins = options.plugins.concat([
                require.resolve(
                  '@umijs/bundler-utils/compiled/babel/plugin-vue-jsx',
                ),
              ]);
              return options;
            });

          return config;
        },
      };
    }

    return memo;
  });

  api.addExtraBabelPlugins(() => {
    // 仅 webpack 执行
    return !api.appData.vite
      ? [require.resolve('@umijs/bundler-utils/compiled/babel/plugin-vue-jsx')]
      : [];
  });
};
