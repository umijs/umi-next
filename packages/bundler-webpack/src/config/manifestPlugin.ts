import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
// @ts-ignore
import { WebpackManifestPlugin } from '@umijs/bundler-webpack/compiled/webpack-manifest-plugin';
import { webpack } from '..';
import type { Env, IConfig } from '../types';

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  webpackManifest?: Map<string, string>;
}

export async function addManifestPlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  if (userConfig.manifest) {
    config.plugin('manifest-plugin').use(WebpackManifestPlugin, [
      {
        fileName: 'asset-manifest.json',
        ...userConfig.manifest,
      },
    ]);
    if (userConfig.ssr && opts.webpackManifest) {
      config
        .plugin('manifest-copy-plugin')
        .use(WebpackAssetsManifestCopyPlugin, [
          opts.userConfig,
          opts.webpackManifest,
        ]);
    }
  }
}

// This webpack plugin can copy the assets-manifest.json into the webpackManifest variable.
// The webpackManifest variable will be passed to esbuild for building umi.server.js
class WebpackAssetsManifestCopyPlugin {
  userConfig: any;
  webpackManifest: Map<string, string>;

  constructor(userConfig: any, webpackManifest: Map<string, string>) {
    this.userConfig = userConfig;
    this.webpackManifest = webpackManifest;
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
                key === this.userConfig.manifest.fileName ||
                key === 'asset-manifest.json',
            );
            if (!manifestKey) return;
            const manifestSource = a[manifestKey].source();
            const manifest = JSON.parse(
              typeof manifestSource === 'string'
                ? manifestSource
                : manifestSource.toString(),
            );
            Object.keys(manifest).forEach((key) => {
              this.webpackManifest.set(key, manifest[key]);
            });
          },
        );
      },
    );
  }
}
