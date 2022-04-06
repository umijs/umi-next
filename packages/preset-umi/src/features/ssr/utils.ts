import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { join, resolve } from 'path';
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
  type: 'loader' | 'clientLoader',
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
