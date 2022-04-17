import type { IApi } from 'umi';
import VueLoaderPlugin from 'vue-loader/dist/pluginWebpack5.js';
import { addAssetRules } from './assetRules';
import { addCSSRules } from './cssRules';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:webpack',
  });

  // webpack
  api.chainWebpack((config) => {
    config.module.noParse(/^(vue|vue-router|vuex|vuex-router-sync)$/);

    // https://github.com/webpack/webpack/issues/14532#issuecomment-947525539
    config.output.set('hashFunction', 'xxhash64');

    // https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
    config.module
      .rule('esm')
      .test(/\.m?jsx?$/)
      .resolve.set('fullySpecified', false);

    config.resolve.extensions.merge(['.vue']).end();

    config.module
      .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
      .loader(require.resolve('vue-loader'))
      .options({
        babelParserPlugins: ['jsx', 'classProperties', 'decorators-legacy'],
      });

    config.plugin('vue-loader-plugin').use(VueLoaderPlugin);

    // https://github.com/vuejs/vue-loader/issues/1435#issuecomment-869074949
    config.module
      .rule('vue-style')
      .test(/\.vue$/)
      .resourceQuery(/type=style/)
      .sideEffects(true);

    // css
    addCSSRules({ api, config });

    // asset
    // bundler-webpack 本身自带的静态资源会触发 vue-loader currently does not support vue rules with oneOf. 需要禁用掉
    config.module.rules.delete('asset');

    addAssetRules({ api, config });

    return config;
  });

  api.modifyWebpackConfig((webpack) => {
    // 兼容 element-ui plus
    webpack.module?.rules?.push({
      test: /\.mjs$/,
      resolve: {
        fullySpecified: false,
      },
      include: /node_modules/,
      type: 'javascript/auto',
    });
    return webpack;
  });
};
