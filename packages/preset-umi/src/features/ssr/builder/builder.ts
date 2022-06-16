import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { logger } from '@umijs/utils';
import { resolve } from 'path';
import { IApi } from '../../../types';
import {
  absServerBuildPath,
  esbuildUmiPlugin,
  saveAssetsManifestToCache,
} from '../utils';
import assetsLoader from './assets-loader';
import { cssLoader } from './css-loader';
import { lessLoader } from './less-loader';
import svgLoader from './svg-loader';

export async function build(opts: {
  api: IApi;
  assetsManifest: any;
  watch?: boolean;
}) {
  const { api, assetsManifest, watch } = opts;
  logger.info('[ssr] build server');

  // TODO: 支持通用的 alias
  // TODO: external all import from package.json.dependencies
  await esbuild.build({
    format: 'cjs',
    platform: 'node',
    target: 'esnext',
    bundle: true,
    logLevel: 'silent',
    inject: [
      resolve(api.paths.absTmpPath, 'ssr/react-shim.js'),
      resolve(api.paths.absTmpPath, 'ssr/webpack-manifest.js'),
    ],
    watch: watch
      ? {
          onRebuild() {
            saveAssetsManifestToCache(api, assetsManifest);
            delete require.cache[absServerBuildPath(api)];
          },
        }
      : false,
    loader,
    entryPoints: [resolve(api.paths.absTmpPath, 'umi.server.ts')],
    plugins: [
      esbuildUmiPlugin(api),
      lessLoader({ cwd: api.cwd }),
      cssLoader({ cwd: api.cwd }),
      svgLoader(assetsManifest),
      assetsLoader(assetsManifest),
    ],
    outfile: absServerBuildPath(api),
  });
}

export const loader: { [ext: string]: esbuild.Loader } = {
  '.aac': 'file',
  '.css': 'text',
  '.less': 'text',
  '.sass': 'text',
  '.scss': 'text',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.ico': 'file',
  '.jpeg': 'file',
  '.jpg': 'file',
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.json': 'json',
  '.md': 'jsx',
  '.mdx': 'jsx',
  '.mp3': 'file',
  '.mp4': 'file',
  '.ogg': 'file',
  '.otf': 'file',
  '.png': 'file',
  '.svg': 'file',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.ttf': 'file',
  '.wav': 'file',
  '.webm': 'file',
  '.webp': 'file',
  '.woff': 'file',
  '.woff2': 'file',
};
