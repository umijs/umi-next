import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { EnableBy } from '@umijs/core/dist/types';
import { logger } from '@umijs/utils';
import { resolve } from 'path';
import type { IApi } from '../../types';
import { esbuildIgnorePathPrefixPlugin, esbuildUmiPlugin } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'ssr',
    config: {
      schema(Joi) {
        return Joi.object({
          serverBuildPath: Joi.string(),
        });
      },
    },
    enableBy: EnableBy.config,
  });

  api.addBeforeMiddlewares(() => [
    async (req, res, next) => {
      (await require(absServerBuildPath(api))).default(req, res, next);
    },
  ]);

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
    await esbuild.build({
      format: 'cjs',
      platform: 'node',
      target: 'esnext',
      bundle: true,
      watch: api.env === 'development' && {
        onRebuild(error) {
          if (error) logger.error(error);
          delete require.cache[absServerBuildPath(api)];
        },
      },
      logLevel: 'error',
      external: ['umi'],
      entryPoints: [resolve(api.paths.absTmpPath, 'server.ts')],
      plugins: [esbuildIgnorePathPrefixPlugin(), esbuildUmiPlugin(api)],
      outfile: absServerBuildPath(api),
    });
  });
};

function absServerBuildPath(api: IApi) {
  return resolve(
    api.paths.cwd,
    api.userConfig.ssr.serverBuildPath || 'server/umi.server.js',
  );
}
