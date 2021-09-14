import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
}

export async function addSVGRules(opts: IOpts) {
  const { config } = opts;
  const rule = config.module.rule('svg').test(/\.svg$/)
  rule
    .use('file-loader')
    .loader(
      require.resolve('@umijs/bundler-webpack/compiled/svgo-loader'),
    ).options({ configFile: false })
}
