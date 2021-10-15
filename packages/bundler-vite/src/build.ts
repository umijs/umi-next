import { logger } from '@umijs/utils';
import { build as viteBuild } from 'vite';
import { getConfig } from './config/config';
import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
  clean?: boolean;
}

export async function build(opts: IOpts): Promise<void> {
  logger.info(`build`, JSON.stringify(opts));

  const userConfig = opts.config;
  const viteConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.production,
    entry: opts.entry,
    userConfig,
  });
  
  viteBuild({
    root: process.env.APP_ROOT,
    base: userConfig.publicPath,
    mode: Env.production,
    ...viteConfig
  });
}
