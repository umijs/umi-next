import { join } from 'path';
import type { IApi } from 'umi';
import { winPath } from 'umi/plugin-utils';
import { TEMPLATES_DIR } from '../../constants';

export default (api: IApi) => {
  api.describe({
    key: 'preset-vue:tmpFiles',
  });

  api.register({
    key: 'onGenerateFiles',
    fn: async () => {
      // history.ts
      const rendererPath = winPath(
        await api.applyPlugins({
          key: 'modifyRendererPath',
        }),
      );

      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/history.ts',
        tplPath: join(TEMPLATES_DIR, 'history.tpl'),
        context: {
          rendererPath,
        },
      });

      // EmptyRoutes.vue
      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/EmptyRoute.vue',
        content: `
      <template>
      <router-view></router-view>
      </template>
        `,
      });

      // App.vue
      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/App.vue',
        content: `
      <template>
      <router-view></router-view>
      </template>
        `,
      });
    },
    // 覆盖preset-umi 中的文件生成
    stage: Infinity,
  });
};
