import type { Compiler } from '@umijs/bundler-webpack/compiled/webpack';
import { sources } from '@umijs/bundler-webpack/compiled/webpack';
import { extname } from 'path';
import Config from '../../compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

const PLUGIN_NAME = 'SSR_PLUGIN';

class SSRPlugin {
  apply(compiler: Compiler) {
    // ref: https://github.com/webdeveric/webpack-assets-manifest
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(PLUGIN_NAME, () => {
        const assets = compilation.getAssets().filter((asset) => {
          if (asset.info.hotModuleReplacement) {
            return false;
          }
          return true;
        });
        const manifest = new Map();
        assets.forEach((asset) => {
          if (asset.info.sourceFilename) {
            manifest.set(asset.info.sourceFilename, asset.name);
          }
        });
        const stats = compilation.getStats().toJson({
          all: false,
          assets: true,
          cachedAssets: true,
          cachedModules: true,
        });
        const { assetsByChunkName } = stats;
        Object.keys(assetsByChunkName!).forEach((chunkName) => {
          assetsByChunkName![chunkName].forEach((filename) => {
            const ext = extname(filename.split(/[?#]/)[0]);
            manifest.set(chunkName + ext, filename);
          });
        });
        // console.log('test', Object.fromEntries(manifest));

        compilation.emitAsset(
          'ssr-manifest.json',
          new sources.RawSource(
            JSON.stringify(
              {
                assets: Object.fromEntries(manifest),
              },
              null,
              2,
            ),
            false,
          ),
        );
      });
    });
  }
}

export default function addSSRPlugin(opts: IOpts) {
  if (opts.userConfig.ssr) {
    opts.config.plugin('ssr-plugin').use(SSRPlugin);
  }
}
