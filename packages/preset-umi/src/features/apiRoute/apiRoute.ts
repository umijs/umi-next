import * as bundlerEsbuild from '@umijs/bundler-esbuild';
import { IRoute } from '@umijs/core';
import { logger } from '@umijs/utils';
import fs from 'fs';
import { join, resolve } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi, IApiMiddleware } from '../../types';

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
  });

  // 生成中间产物时，将 API 路由与插件注册的中间件封装到临时文件目录下
  api.onGenerateFiles(async () => {
    const hasApiRoutes = fs.existsSync(api.paths.absSrcPath + '/api');
    if (!hasApiRoutes) return;

    const config = api.userConfig.apiRoute;
    if (!config) {
      logger.warn(
        '侦测到 ./src/api 目录存在，但没有配置 config.apiRoute 选项，因此 API 路由功能将不会生效！',
      );
      return;
    }
    if (!config.platform) {
      logger.warn(
        '请设置 config.apiRoute.platform 配置项，否则 API 路由功能将不会生效！',
      );
      return;
    }

    const platform = getPlatform(config.platform);
    if (!platform) {
      logger.warn(
        '配置项 config.apiRoute.platform 输入了无效的值：' +
          config.platform +
          '，因此 API 路由功能将不会生效！',
      );
      return;
    }

    if (platform !== 'vercel') {
      logger.warn(
        '当前版本的 Umi 仅支持将 API 路由部署到 Vercel，因此 API 路由功能将不会生效！',
      );
      return;
    }

    // @TODO: 根据 platform 的值执行不同 Adapter 的流程

    const apiRoutes: IRoute[] = Object.keys(api.appData.apiRoutes).map(
      (k) => api.appData.apiRoutes[k],
    );

    apiRoutes.map((apiRoute) => {
      api.writeTmpFile({
        noPluginDir: true,
        path: 'api/' + apiRoute.file,
        tplPath: join(TEMPLATES_DIR, 'apiRoute.tpl'),
        context: {
          adapterPath: resolve(__dirname, '../apiRoute/vercel/index.js'),
          apiRootDirPath: api.paths.absTmpPath + '/api',
          handlerPath: api.paths.absSrcPath + '/api/' + apiRoute.file,
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

    const apiRoutePaths = Object.keys(api.appData.apiRoutes).map(
      (key) => api.paths.absTmpPath + '/api/' + api.appData.apiRoutes[key].file,
    );

    await bundlerEsbuild.buildApiRoutes({
      format: 'esm',
      outExtension: { '.js': '.mjs' },
      bundle: true,
      entryPoints: [
        ...apiRoutePaths,
        api.paths.absTmpPath + '/api/_middlewares.ts',
      ],
      outdir: api.paths.absSrcPath + '/../.output/server/pages/api',
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
