import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import CopyPlugin from '@umijs/bundler-webpack/compiled/copy-webpack-plugin';

import { existsSync } from 'fs';
import { join } from 'path';
import { DEFAULT_OUTPUT_PATH } from '../constants';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function applyCopyPlugin(opts: IOpts) {
  const { config, userConfig, cwd } = opts;
  const absOutputPath = join(
    cwd,
    userConfig.outputPath || DEFAULT_OUTPUT_PATH,
  );
  const copyPatterns = [
    existsSync(join(cwd, 'public')) && {
      from: join(cwd, 'public'),
      to: absOutputPath,
    },
    ...(userConfig.copy
      ? userConfig.copy.map((item) => {
        if (typeof item === 'string') {
          return {
            from: join(cwd, item),
            to: absOutputPath,
          };
        }
        return {
          from: join(cwd, item.from),
          to: join(absOutputPath, item.to),
        };
      })
      : []),
  ].filter(Boolean);

  if (copyPatterns.length) {
    // TODO: must do build:deps for copy-webpack-plugin
    config
      .plugin('copy')
      .use(CopyPlugin, [
        {
          patterns: copyPatterns,
        },
      ]);
  }
}
