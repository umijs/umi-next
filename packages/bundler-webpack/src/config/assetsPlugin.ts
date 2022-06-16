import { webpack } from '..';
import Config from '../../compiled/webpack-5-chain';
import type { Env, IConfig } from '../types';

interface AssetsMappingItem {
  source: string | Buffer | undefined;
  generatedPath: string | undefined;
}

const PLUGIN_NAME = 'WebpackAssetsMappingPlugin';

/**
 * The WebpackAssetsMappingPlugin will generate a `assets.json` file into dist directory.
 *
 * The `assets.json` contains the mapping between the source of asset and the generated path.
 *
 * It will be used in SSR for esbuild to transform the assets import into correct url.
 * */
class WebpackAssetsMappingPlugin {
  private manifest: Map<string, string>;

  constructor(manifest: Map<string, string>) {
    this.manifest = manifest;
  }

  apply(compiler: webpack.Compiler) {
    const assets: { [sourcePath: string]: AssetsMappingItem } = {};
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.finishModules.tap(PLUGIN_NAME, (a) => {
        for (let i of a) {
          if (i.getSourceTypes().has('asset')) {
            assets[(i as any).resource] = {
              source: i.originalSource()?.source(),
              generatedPath: undefined,
            };
          }
        }
      });
      compilation.hooks.afterProcessAssets.tap(PLUGIN_NAME, (a) => {
        for (let i in a) {
          const f = Object.keys(assets).find(
            (as) => assets[as].source === a[i].source(),
          );
          if (f) assets[f].generatedPath = i;
        }
        for (let i in assets) {
          const { generatedPath } = assets[i];
          if (generatedPath) this.manifest.set(i, generatedPath);
        }
      });
    });
  }
}

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  assetsManifest?: Map<string, string>;
}

export default function addWebpackAssetsMappingPlugin(opts: IOpts) {
  if (!opts.assetsManifest) return;
  const { config } = opts;
  config
    .plugin('assets-mapping-plugin')
    .use(WebpackAssetsMappingPlugin, [opts.assetsManifest]);
}
