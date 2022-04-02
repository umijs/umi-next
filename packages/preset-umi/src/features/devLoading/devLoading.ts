import { Mustache } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BuildStatus, IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return api.name === 'dev';
    },
  });

  api.addHTMLScripts(() => [
    {
      content: `var umi_dev_loading = '_____UMI_DEV__DONE___'`,
    },
  ]);

  api.onDevBuildStatus(({ status }) => {
    buildStatusQueue.add(status);
  });

  let isFirstLoading = false;
  let buildStatusQueue = new Set();

  api.addBeforeMiddlewares(() => {
    const tpl = readFileSync(
      join(__dirname, '../../../templates/devLoading.tpl'),
      'utf-8',
    );

    return [
      async (_req, res, next) => {
        if (isFirstLoading) {
          return next();
        }

        const done = () => {
          isFirstLoading = true;
          next();
        };

        // static
        const enableVite = !!api.config.vite;

        // vite 模式编译完成
        if (enableVite && buildStatusQueue.has(BuildStatus.compilerDone)) {
          return done();
        }

        const enableMFSU = api.config.mfsu !== false;

        // webpack 模式非mfsu 编译完成
        if (!enableMFSU && buildStatusQueue.has(BuildStatus.compilerDone)) {
          return done();
        }

        // webpack 模式mfsu 编译完成.
        if (
          buildStatusQueue.has(BuildStatus.compilerDone) &&
          buildStatusQueue.has(BuildStatus.mfsuCompilerDone)
        ) {
          return done();
        }

        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.statusCode = 503; /* Service Unavailable */
        return res.end(
          Mustache.render(tpl, {
            messages: {
              appName: 'UMIJS',
              loading: 'Loading..',
            },
          }),
        );
      },
    ];
  });
};
