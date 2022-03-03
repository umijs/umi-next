import * as bundlerEsbuild from '@umijs/bundler-esbuild';
import { IRoute } from '@umijs/core';
import { logger } from '@umijs/utils';
import fs from 'fs';
import { join, resolve } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import type { IApi, IApiMiddleware } from '../../types';

enum ServerlessPlatform {
  Vercel = 'vercel',
  Netlify = 'netlify',
  Worker = 'worker',
}

function getPlatform(p: string) {
  switch (p) {
    case 'vercel':
      return ServerlessPlatform.Vercel;
    case 'netlify':
      return ServerlessPlatform.Netlify;
    case 'worker':
      return ServerlessPlatform.Worker;
    default:
      return undefined;
  }
}

export default (api: IApi) => {
  let isApiRoutesGenerated = false;

  // 注册 API 路由相关配置项
  api.describe({
    key: 'apiRoute',
    config: {
      schema(Joi) {
        return Joi.object({
          platform: Joi.string(),
        });
      },
    },
    enableBy: () => {
      const hasApiRoutes = fs.existsSync(join(api.paths.absSrcPath, 'api'));
      if (!hasApiRoutes) return false;

      const config = api.userConfig.apiRoute;
      if (!config) {
        logger.warn(
          'Directory ./src/api exists, but config.apiRoute is not set. API route feature will not be enabled!',
        );
        return false;
      }
      if (!config.platform) {
        logger.warn(
          'Please set config.apiRoute.platform to enable API route feature!',
        );
        return false;
      }

      const platform = getPlatform(config.platform);
      if (!platform) {
        logger.warn(
          'There is an invalid value of config.apiRoute.platform: ' +
            config.platform +
            ', so API route feature will not be enabled!',
        );
        return false;
      }

      if (platform !== ServerlessPlatform.Vercel) {
        logger.warn(
          'Current version of Umi only supports deploying API routes to Vercel, so API route feature will not be enabled!',
        );
        return false;
      }

      return true;
    },
  });

  // 生成中间产物时，将 API 路由与插件注册的中间件封装到临时文件目录下
  api.onGenerateFiles(async () => {
    // @TODO: 根据 platform 的值执行不同 Adapter 的流程

    const apiRoutes: IRoute[] = Object.keys(api.appData.apiRoutes).map(
      (k) => api.appData.apiRoutes[k],
    );

    apiRoutes.map((apiRoute) => {
      api.writeTmpFile({
        noPluginDir: true,
        path: join('api', apiRoute.file),
        tplPath: join(TEMPLATES_DIR, 'apiRoute.tpl'),
        context: {
          adapterPath: resolve(__dirname, '../apiRoute/vercel/index.js'),
          apiRootDirPath: join(api.paths.absTmpPath, 'api'),
          handlerPath: join(api.paths.absSrcPath, 'api', apiRoute.file),
        },
      });
    });

    const middlewares: IApiMiddleware[] = await api.applyPlugins({
      key: 'addApiMiddlewares',
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: 'api/_middlewares.ts',
      tplPath: join(TEMPLATES_DIR, 'middlewares.tpl'),
      context: { middlewares },
    });

    isApiRoutesGenerated = true;
  });

  // 编译时，将打包好的临时文件根据用户指定的目标平台进行打包
  api.onBeforeCompiler(async () => {
    if (!isApiRoutesGenerated) return;

    // @TODO: 根据 platform 的值执行不同 Adapter 的流程

    const apiRoutePaths = Object.keys(api.appData.apiRoutes).map((key) =>
      join(api.paths.absTmpPath, 'api', api.appData.apiRoutes[key].file),
    );

    await bundlerEsbuild.buildApiRoutes({
      format: 'esm',
      outExtension: { '.js': '.mjs' },
      bundle: true,
      entryPoints: [
        ...apiRoutePaths,
        resolve(api.paths.absTmpPath, 'api/_middlewares.ts'),
      ],
      outdir: resolve(api.paths.cwd, '.output/server/pages/api'),
      // resolve path like "@fs/Users/xxx/..." as "/Users/xxx/..."
      plugins: [
        {
          name: 'alias',
          setup(build: any) {
            build.onResolve({ filter: /^@fs/ }, (args: any) => ({
              path: args.path.replace(/^@fs/, ''),
            }));
          },
        },
      ],
    });
  });
};
