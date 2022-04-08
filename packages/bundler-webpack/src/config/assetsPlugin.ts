import { webpack } from '..';
import Config from '../../compiled/webpack-5-chain';
import { RawSource } from '../../compiled/webpack-sources';
import type { Env, IConfig } from '../types';

interface AssetsMappingItem {
  sourcePath: string;
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
    const assets: AssetsMappingItem[] = [];
    compiler.hooks.compilation.tap(
      'WebpackAssetsMappingPlugin',
      (compilation) => {
        compilation.hooks.finishModules.tap(
          'WebpackAssetsMappingPlugin',
          (a) => {
            for (let i of a) {
              if (i.getSourceTypes().has('asset')) {
                assets.push({
                  sourcePath: (i as any).resource,
                  source: i.originalSource()?.source(),
                  generatedPath: undefined,
                });
              }
            }
          },
        );
        compilation.hooks.afterProcessAssets.tap(
          'WebpackAssetsMappingPlugin',
          (a) => {
            for (let i in a) {
              const f = assets.find((as) => as.source === a[i].source());
              if (f) f.generatedPath = i;
            }
            // @ts-ignore
            compilation.emitAsset(
              'assets.json',
              new RawSource(
                JSON.stringify(
                  assets.map((a) => ({
                    source: a.sourcePath,
                    generated: a.generatedPath,
                  })),
                  null,
                  2,
                ),
              ),
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
