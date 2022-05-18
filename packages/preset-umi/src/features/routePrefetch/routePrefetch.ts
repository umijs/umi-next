import { webpack } from '@umijs/bundler-webpack';
import { RawSource } from 'webpack-sources';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onCheck(() => {
    if (!api.config.manifest) {
      throw new Error('You must enable manifest to use routePrefetch feature!');
    }
  });

  api.chainWebpack((memo) => {
    memo.plugin('manifest-inject-plugin').use(WebpackAssetsInjectPlugin, [api]);
  });
};

class WebpackAssetsInjectPlugin {
  api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.compilation.tap(
      'WebpackAssetsInjectPlugin',
      (compilation) => {
        compilation.hooks.afterProcessAssets.tap(
          'WebpackAssetsInjectPlugin',
          (a) => {
            const manifestKey = Object.keys(a).find(
              (key) =>
                key === this.api.config.manifest.fileName ||
                key === 'asset-manifest.json',
            );
            const umiJsKey = Object.keys(a).find((key) =>
              key.match(/^umi(.*).js$/),
            );
            if (!manifestKey || !umiJsKey) return;
            const newUmiJsString =
              `window.__umi_manifest__ = ${a[manifestKey].source()};` +
              a[umiJsKey].source();
            compilation.deleteAsset(umiJsKey);
            // @ts-ignore
            compilation.emitAsset(umiJsKey, new RawSource(newUmiJsString));
          },
        );
      },
    );
  }
}
