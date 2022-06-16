import type { Compiler } from '@umijs/bundler-webpack/compiled/webpack';
import { EnableBy } from '@umijs/core/dist/types';
import { existsSync } from 'fs';
import type { IApi } from '../../types';
import { build } from './builder/builder';
import { absServerBuildPath } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'ssr',
    config: {
      schema(Joi) {
        return Joi.object({
          serverBuildPath: Joi.string(),
        });
      },
    },
    enableBy: EnableBy.config,
  });

  api.onCheck(() => {
    const reactVersion =
      parseInt(api.appData.react.version.split('.')[0], 10) || 0;
    if (reactVersion < 18) {
      throw new Error(
        `SSR requires React version >= 18.0.0, but got ${reactVersion}.`,
      );
    }
  });

  api.addBeforeMiddlewares(() => [
    async (req, res, next) => {
      const modulePath = absServerBuildPath(api);
      if (existsSync(modulePath)) {
        (await require(modulePath)).default(req, res, next);
      } else {
        // TODO: IMPROVEMENT: use Umi Animation
        res.end('umi.server.js is compiling ...');
      }
    },
  ]);

  api.onGenerateFiles(() => {
    // react-shim.js is for esbuild to build umi.server.js
    api.writeTmpFile({
      noPluginDir: true,
      path: 'ssr/react-shim.js',
      content: `
      import * as React from 'react';
export { React };
`,
    });
  });

  api.onDevCompileDone(async ({ isFirstCompile }) => {
    if (!isFirstCompile) return;
    await build({
      api,
      watch: true,
    });
  });

  // 在 webpack 完成打包以后，使用 esbuild 编译 umi.server.js
  api.onBuildComplete(async ({ err }) => {
    if (err) return;
    await build({
      api,
    });
  });

  const pluginName = 'ProcessAssetsPlugin';
  class ProcessAssetsPlugin {
    apply(compiler: Compiler) {
      compiler.hooks.compilation.tap(pluginName, (compilation) => {
        compilation.hooks.afterProcessAssets.tap(pluginName, () => {
          const modulePath = absServerBuildPath(api);
          delete require.cache[modulePath];
        });
      });
    }
  }

  api.modifyWebpackConfig((config) => {
    config.plugins!.push(new ProcessAssetsPlugin());

    // Limit the number of css chunks to 1.
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        cacheGroups: {
          styles: {
            // TODO: no umi specified
            name: 'umi',
            test: /\.(less|css|scss|sass)$/,
            chunks: 'all',
            minChunks: 1,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    };
    return config;
  });
};
