import { IApi, webpack } from '@umijs/types';
import { getHtmlGenerator } from '../buildDevUtils';

export default function(api: IApi) {
  class HtmlWebpackPlugin {
    apply(compiler: webpack.Compiler) {
      const key = 'UmiHtmlGeneration';
      compiler.hooks.compilation.tap(key, compilation => {
        compilation.hooks.moduleAsset.tap(key, (module, file) => {
          // console.log(module, file);
        });
      });
      compiler.hooks.emit.tap(key, async compilation => {
        // console.log(compilation.chunks as webpack.compilation.Chunk[]);
        const html = getHtmlGenerator({ api });
        const content = await html.getContent({
          route: { path: '/' },
          cssFiles: ['umi.css'],
          jsFiles: ['umi.js'],
        });
        compilation.assets['index.html'] = {
          source: () => content,
          size: () => content.length,
        };
      });
    }
  }

  api.modifyBundleConfig((bundleConfig, { env, bundler: { id } }) => {
    if (env === 'production' && id === 'webpack') {
      bundleConfig.plugins?.unshift(new HtmlWebpackPlugin());
    }
    return bundleConfig;
  });
}
