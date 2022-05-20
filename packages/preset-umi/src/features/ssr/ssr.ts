import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { EnableBy } from '@umijs/core/dist/types';
import { existsSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import type { IApi } from '../../types';
import assetsLoader from './assets-loader';
import cssLoader from './css-loader';
import { lessLoader } from './esbuild-less-plugin';
import svgLoader from './svg-loader';
import {
  absServerBuildPath,
  esbuildIgnorePathPrefixPlugin,
  esbuildUmiPlugin,
  readAssetsManifestFromCache,
  readCssManifestFromCache,
  saveAssetsManifestToCache,
  saveCssManifestToCache,
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

  api.addBeforeMiddlewares(() => [
    async (req, res, next) => {
      const modulePath = absServerBuildPath(api);
      if (existsSync(modulePath)) {
        (await require(modulePath)).default(req, res, next);
      } else {
        res.end('umi.server.js is compiling ...');
      }
    },
  ]);

  // react-shim.js is for esbuild to build umi.server.js
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'react-shim.js',
      content: `
      import * as React from 'react';
export { React };
`,
    });
  });

  // webpack-manifest.js is for esbuild to build umi.server.js
  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'webpack-manifest.js',
      content: `export let __WEBPACK_MANIFEST__ = {}`,
    });
  });

  let isFirstDevCompileDone = true;
  api.onDevCompileDone(async ({ cssManifest, assetsManifest }) => {
    if (isFirstDevCompileDone) {
      isFirstDevCompileDone = false;
      await readCssManifestFromCache(api, cssManifest);
      await readAssetsManifestFromCache(api, assetsManifest);
      await esbuild.build({
        format: 'cjs',
        platform: 'node',
        target: 'esnext',
        bundle: true,
        inject: [
          resolve(api.paths.absTmpPath, 'plugin-ssr/react-shim.js'),
          resolve(api.paths.absTmpPath, 'plugin-ssr/webpack-manifest.js'),
        ],
        watch: {
          onRebuild() {
            saveCssManifestToCache(api, cssManifest);
            saveAssetsManifestToCache(api, assetsManifest);
            delete require.cache[absServerBuildPath(api)];
          },
        },
        logLevel: 'silent',
        loader,
        external: ['umi'],
        entryPoints: [resolve(api.paths.absTmpPath, 'server.ts')],
        plugins: [
          esbuildIgnorePathPrefixPlugin(),
          esbuildUmiPlugin(api),
          lessLoader(api, cssManifest),
          cssLoader(api, cssManifest),
          svgLoader(assetsManifest),
          assetsLoader(assetsManifest),
        ],
        outfile: absServerBuildPath(api),
      });
    }
  });

  // 在 webpack 完成打包以后，使用 esbuild 编译 umi.server.js
  api.onBuildComplete(
    async ({ err, cssManifest, assetsManifest, webpackManifest }) => {
      if (err) return;

      const webpackManifestObject: { [key: string]: string } = {};
      if (webpackManifest) {
        webpackManifest.forEach((value, key) => {
          webpackManifestObject[key] = value;
        });
      }
      // webpack-manifest.js is for esbuild to build umi.server.js
      writeFileSync(
        join(api.paths.absTmpPath, 'plugin-ssr/webpack-manifest.js'),
        `export let __WEBPACK_MANIFEST__ = ${JSON.stringify(
          webpackManifestObject,
        )}`,
      );

      await esbuild.build({
        format: 'cjs',
        platform: 'node',
        target: 'esnext',
        bundle: true,
        logLevel: 'silent',
        inject: [
          resolve(api.paths.absTmpPath, 'plugin-ssr/react-shim.js'),
          resolve(api.paths.absTmpPath, 'plugin-ssr/webpack-manifest.js'),
        ],
        loader,
        external: ['umi'],
        entryPoints: [resolve(api.paths.absTmpPath, 'server.ts')],
        plugins: [
          esbuildIgnorePathPrefixPlugin(),
          esbuildUmiPlugin(api),
          lessLoader(api, cssManifest),
          cssLoader(api, cssManifest),
          svgLoader(assetsManifest),
          assetsLoader(assetsManifest),
        ],
        outfile: absServerBuildPath(api),
      });
    },
  );
};

const loader: { [ext: string]: esbuild.Loader } = {
  '.aac': 'file',
  '.css': 'text',
  '.less': 'text',
  '.sass': 'text',
  '.scss': 'text',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.ico': 'file',
  '.jpeg': 'file',
  '.jpg': 'file',
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.json': 'json',
  '.md': 'jsx',
  '.mdx': 'jsx',
  '.mp3': 'file',
  '.mp4': 'file',
  '.ogg': 'file',
  '.otf': 'file',
  '.png': 'file',
  '.svg': 'file',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.ttf': 'file',
  '.wav': 'file',
  '.webm': 'file',
  '.webp': 'file',
  '.woff': 'file',
  '.woff2': 'file',
};
