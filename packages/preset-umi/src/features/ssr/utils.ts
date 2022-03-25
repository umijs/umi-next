import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { join, resolve } from 'path';
import { IApi, IRoute } from '../../types';

/** Get exports of specific route module */
export async function getRouteModuleExports(
  api: IApi,
  route: IRoute,
): Promise<string[]> {
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
  throw new Error(`${route.file} has no entry point`);
}

/** Get the import strings of route server loaders (for render server.tpl) */
export async function getRouteLoaders(api: IApi) {
  const imports = Object.keys(api.appData.routes)
    .map((key) => {
      const route = api.appData.routes[key];
      if (route.file.startsWith('(')) {
        return `'${key}': () => Promise.resolve(${join(
          api.paths.absPagesPath,
          route.file,
        )}),`;
      }
      return `'${key}': () => import('${join(
        api.paths.absPagesPath,
        route.file,
      )}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}

/** Get the client loaders of routes (if exists) */
export async function getRouteClientLoaders(api: IApi) {
  const routesWithClientLoader: string[] = [];
  await Promise.all(
    Object.keys(api.appData.routes).map(async (key) => {
      const route = api.appData.routes[key];
      const exports = await getRouteModuleExports(api, route);
      if (exports.includes('clientLoader')) routesWithClientLoader.push(key);
    }),
  );
  return routesWithClientLoader.map((key) => {
    const route = api.appData.routes[key];
    return {
      name: key.replace(/\//g, '_') + '_client_loader',
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
