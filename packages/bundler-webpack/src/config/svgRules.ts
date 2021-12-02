import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
  staticPathPrefix: string;
}

export async function addSVGRules(opts: IOpts) {
  const { config, userConfig } = opts;
  const { svgr, svgo = {} } = userConfig;
  if (svgr) {
    const svgrRule = config.module.rule('svgr');
    svgrRule
      .test(/\.svg$/)
      .issuer(/\.[jt]sx?$/)
      .type('javascript/auto')
      //想在 javaScriptRules 中统一处理，可是好像有执行顺序问题
      .use('babel-loader')
      .loader(require.resolve('../../compiled/babel-loader'))
      .options({
        // Tell babel to guess the type, instead assuming all files are modules
        // https://github.com/webpack/webpack/issues/4039#issuecomment-419284940
        sourceType: 'unambiguous',
        babelrc: false,
        cacheDirectory: false,
        targets: userConfig.targets,
        presets: [
          [
            require.resolve('@umijs/babel-preset-umi'),
            {
              presetEnv: {},
              presetReact: {},
              presetTypeScript: {},
              pluginTransformRuntime: {},
              pluginLockCoreJS: {},
              pluginDynamicImportNode: false,
              pluginAutoCSSModules: userConfig.autoCSSModules,
            },
          ],
          ...(userConfig.extraBabelPresets || []).filter(Boolean),
        ],
        plugins: [...(userConfig.extraBabelPlugins || [])].filter(Boolean),
      })
      .end()
      .use('svgr-loader')
      .loader(require.resolve('../loader/svgr'))
      .options({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeTitle: false,
                },
              },
            },
          ],
          ...svgo,
        },
        ...svgr,
        svgo: !!svgo,
      })
      .end()
      .use('url-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/url-loader'))
      .end();
  }
  if (svgo === false) {
    const svgRule = config.module.rule('svg');
    svgRule
      .test(/\.svg$/)
      .use('url-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/url-loader'));
    return;
  }
  const svgRule = config.module.rule('svg');
  svgRule
    .test(/\.svg$/)
    .use('svgo-loader')
    .loader(require.resolve('@umijs/bundler-webpack/compiled/svgo-loader'))
    .options({ configFile: false, ...svgo })
    .end();
}
