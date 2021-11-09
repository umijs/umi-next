import { rimraf } from '@umijs/utils';
import webpack from '../compiled/webpack';
import { getConfig } from './config/config';
import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
  babelPreset?: any;
  chainWebpack?: Function;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  clean?: boolean;
}

export async function build(opts: IOpts): Promise<void> {
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
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
    chainWebpack: opts.chainWebpack,
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
        resolve();
      }
      compiler.close(() => {});
    });
  });
}
