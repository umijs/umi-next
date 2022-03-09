import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { join, resolve } from 'path';
import type { IApi, IRoute } from '../../../types';
import { esbuildIgnorePathPrefixPlugin } from '../utils';
import fs from 'fs';

interface VercelDynamicRouteConfig {
  page: string;
  regex: string;
  routeKeys: { [key: string]: string };
  namedRegex: string;
}

// 将 API 路由的临时文件打包为 Vercel 的 Serverless Function 可以使用的格式
export default async function (api: IApi, apiRoutes: IRoute[]) {
  const apiRoutePaths = apiRoutes.map((r) =>
    join(api.paths.absTmpPath, 'api', r.file),
  );

  await esbuild.build({
    format: 'esm',
    outExtension: { '.js': '.mjs' },
    bundle: true,
    entryPoints: [
      ...apiRoutePaths,
      resolve(api.paths.absTmpPath, 'api/_middlewares.ts'),
    ],
    outdir: resolve(api.paths.cwd, '.output/server/pages/api'),
    plugins: [esbuildIgnorePathPrefixPlugin()],
  });

  const dynamicRoutes: VercelDynamicRouteConfig[] = [];

  apiRoutes.map((r) => {
    if (r.path.match(/\[.*]/)) {
      const keys = r.path
        .match(/\[.*?]/g)
        ?.map((k) => (k = k.replace(/[\[\]]/g, '')));
      const routeKeys: { [key: string]: string } = {};
      keys?.map((k) => {
        routeKeys[k] = k;
      });
      dynamicRoutes.push({
        page: '/api/' + r.path,
        regex: '^/api/' + r.path.replace(/\[.*?]/g, '([^/]+?)') + '(?:/)?$',
        routeKeys,
        namedRegex:
          '^/api/' + r.path.replace(/\[(.*?)]/g, '(?<$1>[^/]+?)') + '(?:/)?$',
      });
    }
  });

  fs.writeFileSync(
    join(api.paths.cwd, '.output/routes-manifest.json'),
    JSON.stringify({ version: 3, dynamicRoutes }, null, 2),
  );
}
