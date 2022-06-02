import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { IApi, IRoute } from '../../types';

/**
 * Get exports of specific route module
 *
 * Example:
 * ```
 * // pages/index.tsx
 * export default function () { / * ... * / }
 * export function loader() { / * ... *  / }
 * export function clientLoader() { / * ... * / }
 * ```
 *
 * getRouteModuleExports(api, routes[index])
 * -> [ 'default', 'loader', 'clientLoader' ];
 * */
export async function getRouteModuleExports(
  api: IApi,
  route: IRoute,
): Promise<string[]> {
  try {
    let result = await esbuild.build({
      entryPoints: [join(api.paths.absPagesPath, route.file)],
      platform: 'neutral',
      format: 'esm',
      metafile: true,
      write: false,
      logLevel: 'silent',
    });
    let metafile = result.metafile!;
    for (let key in metafile.outputs) {
      let output = metafile.outputs[key];
      if (output.entryPoint) return output.exports;
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Get the client/server loaders of routes (if exists)
 *
 * If type is 'serverLoader', example result is:
 * ```
 * [
 *   { name: 'index', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/index.tsx' },
 *   { name: 'users', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/users.tsx' },
 *   { name: 'users/user', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/users/user.tsx' },
 * ];
 * ```
 *
 * If type is 'clientLoader', example result is:
 * ```
 * [
 *   { name: 'index_client_loader', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/index.tsx' },
 *   { name: 'users_client_loader', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/users.tsx' },
 *   { name: 'users_user_client_loader', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/users/user.tsx' },
 * ];
 * ```
 * */
export async function getRouteLoaders(
  api: IApi,
  type: 'serverLoader' | 'clientLoader',
) {
  const routesWithLoader: string[] = [];
  await Promise.all(
    Object.keys(api.appData.routes).map(async (id) => {
      const route = api.appData.routes[id];
      const exports = await getRouteModuleExports(api, route);
      if (exports.includes(type)) routesWithLoader.push(id);
    }),
  );
  return routesWithLoader.map((id) => {
    const route = api.appData.routes[id];
    const name =
      type === 'clientLoader'
        ? // TODO: replace more
          id.replace(/\//g, '_') + '_client_loader'
        : id;
    return {
      name,
      // TODO: 使用路由的绝对路径
      path: join(api.paths.absPagesPath, route.file),
    };
  });
}

/** esbuild plugin for resolving umi imports */
export function esbuildUmiPlugin(api: IApi) {
  return {
    name: 'umi',
    setup(build: any) {
      // TODO: 可能可以去掉
      build.onResolve({ filter: /^react-router$/ }, () => ({
        path: resolve(require.resolve('react-router'), ''),
      }));
      build.onResolve(
        { filter: /^(umi|@umijs\/max|@alipay\/bigfish)$/ },
        () => ({
          path: join(api.paths.absTmpPath, 'exports.ts'),
        }),
      );
    },
  };
}

export function absServerBuildPath(api: IApi) {
  if (api.env === 'development')
    return join(api.paths.absTmpPath, 'server/umi.server.js');

  return resolve(
    api.paths.cwd,
    api.userConfig.ssr.serverBuildPath || 'server/umi.server.js',
  );
}

export function saveMapToFile(
  map: Map<string, string> | undefined,
  filePath: string,
) {
  if (!map) return {};
  const obj: { [key: string]: string } = {};
  for (const [key, value] of map) {
    obj[key] = value;
  }
  if (!existsSync(dirname(filePath))) {
    mkdirSync(dirname(filePath), { recursive: true });
  }
  return writeFileSync(filePath, JSON.stringify(obj));
}

export async function readMapFromFile(
  map: Map<string, string>,
  filePath: string,
) {
  if (!existsSync(filePath)) return;
  const obj = JSON.parse(readFileSync(filePath, 'utf-8'));
  for (const [key, value] of Object.entries(obj)) {
    if (!map.has(key)) map.set(key, value as string);
  }
}

function getSSRCacheDir(api: IApi) {
  const nodeModulesPath = resolve(api.cwd, 'node_modules');
  return join(nodeModulesPath, '.cache/.umi/ssr');
}

export function saveCssManifestToCache(
  api: IApi,
  cssManifest: Map<string, string> | undefined,
) {
  if (!cssManifest) return;
  const cssManifestCachePath = join(getSSRCacheDir(api), 'css-manifest.json');
  return saveMapToFile(cssManifest, cssManifestCachePath);
}

export function saveAssetsManifestToCache(
  api: IApi,
  assetsManifest: Map<string, string> | undefined,
) {
  if (!assetsManifest) return;
  const assetsManifestCachePath = join(
    getSSRCacheDir(api),
    'assets-manifest.json',
  );
  return saveMapToFile(assetsManifest, assetsManifestCachePath);
}

export async function readCssManifestFromCache(
  api: IApi,
  cssManifest: Map<string, string> | undefined,
) {
  const cssManifestCachePath = join(getSSRCacheDir(api), 'css-manifest.json');
  if (cssManifest) await readMapFromFile(cssManifest, cssManifestCachePath);
}

export async function readAssetsManifestFromCache(
  api: IApi,
  assetsManifest: Map<string, string> | undefined,
) {
  const assetsManifestCachePath = join(
    getSSRCacheDir(api),
    'assets-manifest.json',
  );
  if (assetsManifest)
    await readMapFromFile(assetsManifest, assetsManifestCachePath);
}
