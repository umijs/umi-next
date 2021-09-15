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
  const { config, userConfig } = opts;
  const { svgr, svgo } = userConfig;
  const rule = config.module.rule('svg');
  // config svgr to use svgr-loader
  if (svgr) {
    // svgr defaultPlugins: [svgo, jsx], can use svgo:fasle to close svgo-loader
    rule.test(/\.svg$/).use('svgr-loader')
      .loader(require.resolve('@umijs/bundler-webpack/compiled/@svgr/webpack'))
      .options({ ...svgr, svgo });
  } else {
    // config svgo:fasle to close svgo-loader
    if (svgo === false) return;
    rule
      .test(/\.svg$/)
      .use('svgo-loader')
      .loader(
        require.resolve('@umijs/bundler-webpack/compiled/svgo-loader'),
      )
      .options({ configFile: false, ...svgo })
  }
}
