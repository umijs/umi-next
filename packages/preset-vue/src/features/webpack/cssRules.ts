import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { getBrowsersList } from '@umijs/bundler-webpack/dist/utils/browsersList';
import type { IApi } from 'umi';

interface IOpts {
  config: Config;
  api: IApi;
}

export async function addCSSRules({ api, config }: IOpts) {
  config.module.rules.delete('css');
  config.module.rules.delete('less');
  config.module.rules.delete('sass');

  const umiConfig = api.config;

  const shadowMode = !!process.env.UMI_VUE_CSS_SHADOW_MODE;

  const isProd = process.env.NODE_ENV === 'production';

  // 是否导出
  const shouldExtract = !api.userConfig.styleLoader && !shadowMode;

  const needInlineMinification = isProd && !shouldExtract;

  const createCSSRule = (
    lang: string,
    test: RegExp,
    loader?: string,
    options?: Record<string, any>,
  ) => {
    const baseRule = config.module.rule(`vue-${lang}`).test(test);

    // rules for <style module>
    const vueModulesRule = baseRule
      .oneOf('vue-modules')
      .resourceQuery(/module/);
    applyLoaders(vueModulesRule, true);

    // rules for <style>
    const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/);
    applyLoaders(vueNormalRule);

    // rules for *.module.* files
    const extModulesRule = baseRule
      .oneOf('normal-modules')
      .test(/\.module\.\w+$/);
    applyLoaders(extModulesRule);

    // rules for normal CSS imports
    const normalRule = baseRule.oneOf('normal');
    applyLoaders(normalRule);

    function applyLoaders(
      rule: Config.Rule<Config.Rule>,
      forceCssModule = false,
    ) {
      if (shouldExtract) {
        rule
          .use('mini-css-extract-plugin')
          .loader(
            require.resolve(
              '@umijs/bundler-webpack/compiled/mini-css-extract-plugin/loader',
            ),
          )
          .options({
            publicPath: './',
            emit: true,
            esModule: true,
          });
      } else {
        rule
          .use('vue-style-loader')
          .loader(require.resolve('vue-style-loader'))
          .options({
            shadowMode,
          });
      }

      const cssLoaderOptions: Record<string, any> = {
        importLoaders:
          1 + // stylePostLoader injected by vue-loader
          1 + // postcss-loader
          (needInlineMinification ? 1 : 0),
        ...umiConfig.cssLoader,
      };

      if (forceCssModule) {
        cssLoaderOptions.modules = {
          ...cssLoaderOptions.modules,
          auto: () => true,
        };
      }

      if (cssLoaderOptions.modules) {
        cssLoaderOptions.modules = {
          localIdentName: '[name]_[local]_[hash:base64:5]',
          ...umiConfig.cssLoaderModules,
        };
      }

      rule
        .use('css-loader')
        .loader(require.resolve('css-loader'))
        .options(cssLoaderOptions);

      rule
        .use('postcss-loader')
        .loader(
          require.resolve('@umijs/bundler-webpack/compiled/postcss-loader'),
        )
        .options({
          postcssOptions: {
            ident: 'postcss',
            plugins: [
              require('@umijs/bundler-webpack/compiled/postcss-flexbugs-fixes'),
              require('postcss-preset-env')({
                browsers: getBrowsersList({
                  targets: api.config.targets || { chrome: 87 },
                }),
                autoprefixer: {
                  flexbox: 'no-2009',
                  ...umiConfig.autoprefixer,
                },
                stage: 3,
              }),
            ].concat(umiConfig.extraPostCSSPlugins || []),
            ...umiConfig.postcssLoader,
          },
        });

      if (loader) {
        rule
          .use(loader)
          .loader(typeof loader === 'string' ? require.resolve(loader) : loader)
          .options({ ...options });
      }
    }
  };

  createCSSRule('css', /\.css$/);

  createCSSRule(
    'scss',
    /\.scss$/,
    require.resolve('@umijs/bundler-webpack/compiled/sass-loader'),
    umiConfig.sassLoader || {},
  );

  createCSSRule(
    'less',
    /\.less(\?.*)?$/,
    require.resolve('@umijs/bundler-webpack/compiled/less-loader'),
    {
      implementation: require.resolve('@umijs/bundler-utils/compiled/less'),
      lessOptions: {
        modifyVars: umiConfig.theme,
        javascriptEnabled: true,
        ...umiConfig.lessLoader,
      },
    },
  );
}
