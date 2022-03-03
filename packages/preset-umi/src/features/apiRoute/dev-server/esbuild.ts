import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { resolve } from 'path';
import { IApi } from 'umi';
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
  });
}
