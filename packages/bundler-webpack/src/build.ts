import { rimraf } from '@umijs/utils';
import webpack from '../compiled/webpack';
import { getConfig, IOpts as IConfigOpts } from './config/config';
import { Env, IConfig } from './types';

type IOpts = {
  cwd: string;
  rootDir?: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
  babelPreset?: any;
  chainWebpack?: Function;
  modifyWebpackConfig?: Function;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  clean?: boolean;
} & Pick<IConfigOpts, 'cache'>;

export async function build(opts: IOpts): Promise<webpack.Stats> {
  // The assetsManifest records the mapping between
  // the external assets' path and the output name with hash.
  const assetsManifest = new Map<string, string>();

  // The webpackManifest is generated by webpack-assets-manifest plugin
  // esbuild needs this to build the umi.server.js with
  // correct import path for the umi.js and umi.css with hash.
  const webpackManifest = new Map<string, string>();

  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    rootDir: opts.rootDir,
    env: Env.production,
    entry: opts.entry,
    userConfig: opts.config,
    analyze: process.env.ANALYZE,
    babelPreset: opts.babelPreset,
    extraBabelPlugins: [
      ...(opts.beforeBabelPlugins || []),
      ...(opts.extraBabelPlugins || []),
    ],
    extraBabelPresets: [
      ...(opts.beforeBabelPresets || []),
      ...(opts.extraBabelPresets || []),
    ],
    extraBabelIncludes: opts.config.extraBabelIncludes,
    chainWebpack: opts.chainWebpack,
    modifyWebpackConfig: opts.modifyWebpackConfig,
    cache: opts.cache,
    assetsManifest,
    webpackManifest,
  });
  let isFirstCompile = true;
  return new Promise((resolve, reject) => {
    rimraf.sync(webpackConfig.output!.path!);
    const compiler = webpack(webpackConfig);
    compiler.run((err, stats) => {
      opts.onBuildComplete?.({
        err,
        stats,
        isFirstCompile,
        time: stats ? stats.endTime - stats.startTime : null,
        assetsManifest,
        webpackManifest,
      });
      isFirstCompile = false;
      if (err || stats?.hasErrors()) {
        if (err) {
          // console.error(err);
          reject(err);
        }
        if (stats) {
          const errorMsg = stats.toString('errors-only');
          // console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      } else {
        resolve(stats!);
      }
      compiler.close(() => {});
    });
  });
}
