import { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'lazyCompilation',
    config: {
      schema(Joi) {
        return Joi.object();
      },
    },
    enableBy: ({ userConfig }) => {
      return userConfig.lazyCompilation && api.name === 'dev';
    },
  });

  api.chainWebpack((memo) => {
    // @see https://webpack.js.org/configuration/experiments/#experimentslazycompilation
    memo.experiments({
      lazyCompilation: {
        entries: false,
      },
    });
    return memo;
  });
};
