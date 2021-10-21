import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
// @ts-ignore
import FastRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin/lib';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
}

export async function addFastRefreshPlugin(opts: IOpts) {
  const isDev = opts.env === Env.development;
  const { config, userConfig } = opts;
  const { fastRefresh } = userConfig;
  if (!fastRefresh) return;
  if (isDev) {
    config
      .plugin('fastRefresh')
      .after('hmr')
      .use(
        FastRefreshPlugin,
        [{ overlay: false }],
      );
  }
}
