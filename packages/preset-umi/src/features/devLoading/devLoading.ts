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

        // static
        const enableVite = !!api.config.vite;
        if (enableVite && buildStatusQueue.has(BuildStatus.compilerDone)) {
          return next();
        }

        const enableMFSU = api.config.mfsu !== false;

        // 如果未开启mfsu 则判断 compilerDone 即可
        if (!enableMFSU && buildStatusQueue.has(BuildStatus.compilerDone)) {
          return next();
        }

        // 开启mfsu 需要返回
        if (
          buildStatusQueue.has(BuildStatus.compilerDone) &&
          buildStatusQueue.has(BuildStatus.mfsuCompilerDone)
        ) {
          return next();
        }

        // 如果开启mfsu 要判断mfsu 是否完成 否则判断编译是否完成
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
