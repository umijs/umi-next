import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { IApi } from 'umi';

interface IOpts {
  config: Config;
  api: IApi;
}

export async function addAssetRules(opts: IOpts) {
  const { config, api } = opts;
  const { userConfig } = api;

  const inlineLimit = parseInt(userConfig.inlineLimit || '10000', 10);

  // TODO 需要读取正确的配置
  const staticPathPrefix =
    api.config.staticPathPrefix !== undefined
      ? api.config.staticPathPrefix
      : 'static/';

  config.module
    .rule('avif')
    .test(/\.avif$/)
    .type('asset')
    .mimetype('image/avif')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: `${api.config.sta}[name].[hash:8].[ext]`,
    });

  config.module
    .rule('image')
    .test(/\.(bmp|gif|jpg|jpeg|png)$/)
    .type('asset')
    .parser({
      dataUrlCondition: {
        maxSize: inlineLimit,
      },
    })
    .generator({
      filename: `${staticPathPrefix}[name].[hash:8].[ext]`,
    });
}
