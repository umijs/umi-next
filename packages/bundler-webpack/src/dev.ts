import { MFSU, MF_DEP_PREFIX } from '@umijs/mfsu';
import webpack from '../compiled/webpack';
import { getConfig } from './config/config';
import { createServer } from './server/server';
import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  config: IConfig;
  entry: Record<string, string>;
}

export async function dev(opts: IOpts) {
  const mfsu = new MFSU({
    implementor: webpack as any,
  });
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
    extraBabelPlugins: mfsu.getBabelPlugins(),
    hmr: true,
  });
  const depConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
    hash: true,
    staticPathPrefix: MF_DEP_PREFIX,
  });
  mfsu.setWebpackConfig({
    config: webpackConfig as any,
    depConfig: depConfig as any,
  });
  await createServer({
    webpackConfig,
    userConfig: opts.config,
    cwd: opts.cwd,
    beforeMiddlewares: [...mfsu.getMiddlewares()],
  });
}
