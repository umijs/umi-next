import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import { join, resolve } from 'path';
import type { IApi } from '../../../types';
import { esbuildIgnorePathPrefixPlugin } from '../utils';

// 将 API 路由的临时文件打包为 Umi Dev Server 可以使用的格式
export default async function (api: IApi, apiRoutePaths: string[]) {
  await esbuild.build({
    format: 'cjs',
    bundle: true,
    entryPoints: [
      ...apiRoutePaths,
      resolve(api.paths.absTmpPath, 'api/_middlewares.ts'),
    ],
    outdir: resolve(api.paths.cwd, '.output/server/pages/api'),
    plugins: [esbuildIgnorePathPrefixPlugin()],
    watch: {
      onRebuild(error) {
        if (error) logger.error('Compile api routes failed: ', error);

        // Reload API route modules
        Object.keys(require.cache).forEach((modulePath) => {
          if (
            modulePath.startsWith(
              join(api.paths.cwd, '.output/server/pages/api'),
            )
          )
            delete require.cache[modulePath];
        });
      },
    },
  });
}
