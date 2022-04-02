import { Env } from '@umijs/core';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.describe({
    key: 'vite',
    config: {
      schema(Joi) {
        return Joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  // scan deps into api.appData by default for vite mode
  api.register({
    key: 'onBeforeCompiler',
    stage: Number.POSITIVE_INFINITY,
    async fn() {
      await api.applyPlugins({
        key: 'updateAppDataDeps',
        type: api.ApplyPluginsType.event,
      });
    },
  });

  // include extra monorepo package deps for vite pre-bundle
  api.modifyViteConfig((memo) => {
    memo.optimizeDeps = {
      ...(memo.optimizeDeps || {}),
      include: memo.optimizeDeps?.include?.concat(
        Object.values(api.appData.deps!)
          .map(({ matches }) => matches[0])
          .filter(
            (item) =>
              item?.startsWith('@fs') && !item?.includes('node_modules'),
          ),
      ),
    };

    return memo;
  });

  api.modifyDefaultConfig((memo) => {
    // 开发模式默认不开启 polyfill默认会产生过多的js 导致首次打开慢
    if (api.env === Env.development) {
      memo.polyfill = false;
    }
    return memo;
  });

  // add script modules and links to vite output htmldocument,to meet targets whether or not support ESM
  let buildStats: any;
  api.onBuildComplete(({ err, stats }) => {
    if (!err) {
      buildStats = stats;
    }
  });
  api.modifyHTML(($) => {
    if (buildStats) {
      $('head').append(buildStats.extraHtml.head);
      $('body').append(buildStats.extraHtml.body);
    }
    return $;
  });
};
