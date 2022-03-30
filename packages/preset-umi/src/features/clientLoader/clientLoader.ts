import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import { resolve } from 'path';
import type { IApi } from '../../types';
import { esbuildIgnorePathPrefixPlugin, esbuildUmiPlugin } from './utils';

export default (api: IApi) => {
  /* 把 core/loader.ts (在 tmpFile.ts 的 onGenerateFiles 产生的) 编译成 core/loader.js
  core/loader.js 会被 core/route.ts 引用，将每个 route 的 clientLoader 注入进去 */
  api.onBeforeCompiler(async () => {
    await esbuild.build({
      format: 'cjs',
      platform: 'browser',
      target: 'esnext',
      watch: api.env === 'development' && {
        onRebuild(error) {
          if (error) logger.error(error);
          delete require.cache[
            resolve(api.paths.absTmpPath, 'core/loaders.js')
          ];
        },
      },
      bundle: true,
      logLevel: 'error',
      external: ['react'],
      entryPoints: [resolve(api.paths.absTmpPath, 'core/loaders.ts')],
      plugins: [esbuildIgnorePathPrefixPlugin(), esbuildUmiPlugin(api)],
      outfile: resolve(api.paths.absTmpPath, 'core/loaders.js'),
    });
  });
};
