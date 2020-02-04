import { IApi, webpack, IScriptType } from '@umijs/types';

export default function(api: IApi) {
  const { Html, config } = api;

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
        const html = new Html({
          config: api.config as any,
        });
        const headJSFiles: IScriptType = await api.applyPlugins({
          key: 'addHTMLHeadScript',
          type: api.ApplyPluginsType.add,
          initialValue: api.config.headScripts || [],
          // args: { route },
        });
        const content = html.getContent({
          route: { path: '/' },
          headJSFiles,
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
