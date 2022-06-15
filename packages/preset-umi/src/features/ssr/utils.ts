import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { IApi } from '../../types';

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
