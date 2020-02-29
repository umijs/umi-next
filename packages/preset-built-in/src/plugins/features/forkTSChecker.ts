import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'enableTSChecker',
    config: {
      schema(joi) {
        return joi.boolean();
      },
    },
    enableBy: () =>
      process.env.FORK_TS_CHECKER || api.config?.enableTSChecker,
  });

  api.chainWebpack(webpackConfig => {
    webpackConfig
      .plugin('fork-ts-checker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        {
          formatter: 'codeframe',
          // parallel
          async: false,
          checkSyntacticErrors: true,
        },
      ]);
    return webpackConfig;
  });
};
