import { getConfig } from './config/config';
import { createServer } from './server/server';

import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  config: IConfig;
  entry: Record<string, string>;
}

export async function dev(opts: IOpts) {
  const viteConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
  });
console.log(viteConfig)
  await createServer({
    viteConfig,
    userConfig: opts.config,
    cwd: opts.cwd,
  });
}
