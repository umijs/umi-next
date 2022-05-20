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
 * If type is 'loader', example result is:
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
  const routesWithClientLoader: string[] = [];
  await Promise.all(
    Object.keys(api.appData.routes).map(async (key) => {
      const route = api.appData.routes[key];
      const exports = await getRouteModuleExports(api, route);
      if (exports.includes(type)) routesWithClientLoader.push(key);
    }),
  );
  return routesWithClientLoader.map((key) => {
    const route = api.appData.routes[key];
    const name =
      type === 'clientLoader'
        ? key.replace(/\//g, '_') + '_client_loader'
        : key;
    return {
      name,
      path: join(api.paths.absPagesPath, route.file),
    };
  });
}

/** esbuild plugin for ignore @fs prefix */
export function esbuildIgnorePathPrefixPlugin() {
  return {
    name: 'ignore-path-prefix',
    setup(build: any) {
      build.onResolve({ filter: /^@fs/ }, (args: any) => ({
        path: args.path.replace(/^@fs/, ''),
      }));
    },
  };
}

/** esbuild plugin for resolving umi imports */
export function esbuildUmiPlugin(api: IApi) {
  return {
    name: 'umi',
    setup(build: any) {
      build.onResolve({ filter: /^react-router$/ }, () => ({
        path: resolve(require.resolve('react-router'), ''),
      }));
      build.onResolve({ filter: /^umi$/ }, () => ({
        path: join(api.paths.absTmpPath, 'exports.ts'),
      }));
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

export async function saveMapToFile(
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
  return join(nodeModulesPath, '.cache/ssr');
}

export async function saveCssManifestToCache(
  api: IApi,
  cssManifest: Map<string, string> | undefined,
) {
  if (!cssManifest) return;
  const cssManifestCachePath = join(getSSRCacheDir(api), 'css-manifest.json');
  return saveMapToFile(cssManifest, cssManifestCachePath);
}

export async function saveAssetsManifestToCache(
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
