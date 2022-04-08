import { webpack } from '..';
import Config from '../../compiled/webpack-5-chain';
import { RawSource } from '../../compiled/webpack-sources';
import type { Env, IConfig } from '../types';

interface AssetsMappingItem {
  source: string | Buffer | undefined;
  generatedPath: string | undefined;
}

/**
 * The WebpackAssetsMappingPlugin will generate a `assets.json` file into dist directory.
 *
 * The `assets.json` contains the mapping between the source of asset and the generated path.
 *
 * It will be used in SSR for esbuild to transform the assets import into correct url.
 * */
class WebpackAssetsMappingPlugin {
  apply(compiler: webpack.Compiler) {
    const assets: { [sourcePath: string]: AssetsMappingItem } = {};
    compiler.hooks.compilation.tap(
      'WebpackAssetsMappingPlugin',
      (compilation) => {
        compilation.hooks.finishModules.tap(
          'WebpackAssetsMappingPlugin',
          (a) => {
            for (let i of a) {
              if (i.getSourceTypes().has('asset')) {
                assets[(i as any).resource] = {
                  source: i.originalSource()?.source(),
                  generatedPath: undefined,
                };
              }
            }
          },
        );
        compilation.hooks.afterProcessAssets.tap(
          'WebpackAssetsMappingPlugin',
          (a) => {
            for (let i in a) {
              const f = Object.keys(assets).find(
                (as) => assets[as].source === a[i].source(),
              );
              if (f) assets[f].generatedPath = i;
            }
            const assetsResult: { [sourcePath: string]: string } = {};
            for (let i in assets) {
              const { generatedPath } = assets[i];
              if (generatedPath) assetsResult[i] = generatedPath;
            }
            compilation.emitAsset(
              'assets.json',
              // @ts-ignore
              new RawSource(JSON.stringify(assetsResult, null, 2)),
            );
          },
        );
      },
    );
  }
}

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export default function addWebpackAssetsMappingPlugin(opts: IOpts) {
  const { config } = opts;
  config.plugin('assets-mapping-plugin').use(WebpackAssetsMappingPlugin);
}
