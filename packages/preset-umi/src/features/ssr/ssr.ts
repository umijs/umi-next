import { EnableBy } from '@umijs/core/dist/types';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { IApi } from '../../types';
import { build } from './builder/builder';
import {
  absServerBuildPath,
  readAssetsManifestFromCache,
  saveAssetsManifestToCache,
} from './utils';

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
    if (!api.config.manifest) {
      throw new Error(`SSR requires manifest config.`);
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

    // webpack-manifest.js is for esbuild to build umi.server.js
    api.writeTmpFile({
      noPluginDir: true,
      path: 'ssr/webpack-manifest.js',
      // 开发阶段 __WEBPACK_MANIFEST__ 为空
      content: `export let __WEBPACK_MANIFEST__ = {}`,
    });
  });

  api.onDevCompileDone(async ({ isFirstCompile, assetsManifest }) => {
    if (!isFirstCompile) return;

    // TODO: 如果有 webpack fs cache，manifest 会数据不全
    await readAssetsManifestFromCache(api, assetsManifest);
    saveAssetsManifestToCache(api, assetsManifest);

    await build({
      api,
      assetsManifest,
      watch: true,
    });
  });

  // 在 webpack 完成打包以后，使用 esbuild 编译 umi.server.js
  api.onBuildComplete(async ({ err, assetsManifest, webpackManifest }) => {
    if (err) return;

    const webpackManifestObject: { [key: string]: string } = {};
    if (webpackManifest) {
      webpackManifest.forEach((value, key) => {
        webpackManifestObject[key] = value;
      });
    }
    // webpack-manifest.js is for esbuild to build umi.server.js
    // TODO: 改成 api.writeTmpFile
    writeFileSync(
      join(api.paths.absTmpPath, 'ssr/webpack-manifest.js'),
      `export let __WEBPACK_MANIFEST__ = ${JSON.stringify(
        webpackManifestObject,
      )}`,
    );

    await build({
      api,
      assetsManifest,
    });
  });
};
