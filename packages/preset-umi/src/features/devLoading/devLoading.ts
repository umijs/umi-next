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

  api.modifyHTML(($) => {
    // TODO 页面js加载过多时去除白屏的 loading 代码只是提取 devLoading.tpl 中的 loading 部分. loading 未来会重新实现这里先临时放一下只实现功能
    $(`#${api.config.mountElementId}`).append(`
      <section      id="__umi_loading__"      style="      display: flex;      align-items: center;      justify-content: center;      text-align: center;      height: 100vh;      flex-direction: column;      background: #0e2a47;    "><style scoped>        .umi-logo {          font-size: 1.5rem;          font-weight: 500;          line-height: 1.75rem;          display: flex;          align-items: center;          color: #fff;          text-decoration: none;          font-family: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";        }        .umi-logo img {          width: 2.5rem;          height: 2.5rem;          padding-right: 8px;        }        .umi-logo span {          color: #1191ff;          padding-right: 6px;        }        .lds-ellipsis {          position: relative;          width: 80px;          height: 40px;        }        .lds-ellipsis div {          position: absolute;          top: 50%;          width: 13px;          height: 13px;          border-radius: 50%;          background: #1191ff;          animation-timing-function: cubic-bezier(0, 1, 1, 0);        }        .lds-ellipsis div:nth-child(1) {          left: 8px;          animation: lds-ellipsis1 0.6s infinite;        }        .lds-ellipsis div:nth-child(2) {          left: 8px;          animation: lds-ellipsis2 0.6s infinite;        }        .lds-ellipsis div:nth-child(3) {          left: 32px;          animation: lds-ellipsis2 0.6s infinite;        }        .lds-ellipsis div:nth-child(4) {          left: 56px;          animation: lds-ellipsis3 0.6s infinite;        }        @keyframes lds-ellipsis1 {          0% {            transform: scale(0);          }          100% {            transform: scale(1);          }        }        @keyframes lds-ellipsis3 {          0% {            transform: scale(1);          }          100% {            transform: scale(0);          }        }        @keyframes lds-ellipsis2 {          0% {            transform: translate(0, 0);          }          100% {            transform: translate(24px, 0);          }        }</style><a href="https://next.umijs.org/" target="_blank" rel="noopener" class="umi-logo"><img  src="data:image/png;base64,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" /><span>UmiJs</span>    Loading...</a><div class="umi-loading"><div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div></section>
    `);
    return $;
  });

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
