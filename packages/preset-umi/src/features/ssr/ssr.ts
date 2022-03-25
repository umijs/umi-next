import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { EnableBy } from '@umijs/core/dist/types';
import { lodash, winPath } from '@umijs/utils';
import { dirname, join, resolve } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import type { IApi } from '../../types';
import {
  esbuildIgnorePathPrefixPlugin,
  esbuildUmiPlugin,
  getRouteClientLoaders,
  getRouteLoaders,
} from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'ssr',
    config: {
      schema(Joi) {
        return Joi.object();
      },
    },
    enableBy: EnableBy.config,
  });

  api.onGenerateFiles(async () => {
    const rendererPath = winPath(
      await api.applyPlugins({
        key: 'modifyRendererPath',
        initialValue: dirname(
          require.resolve('@umijs/renderer-react/package.json'),
        ),
      }),
    );
    const clonedRoutes = lodash.cloneDeep(api.appData.routes);
    for (const id of Object.keys(clonedRoutes)) {
      for (const key of Object.keys(clonedRoutes[id])) {
        if (key.startsWith('__') || key.startsWith('absPath')) {
          delete clonedRoutes[id][key];
        }
      }
      clonedRoutes[id].component = `await import(${resolve(
        api.paths.absPagesPath!,
        id + '.tsx',
      )})`;
    }
    const validKeys = await api.applyPlugins({
      key: 'addRuntimePluginKey',
      initialValue: [
        'patchRoutes',
        'rootContainer',
        'innerProvider',
        'i18nProvider',
        'accessProvider',
        'dataflowProvider',
        'outerProvider',
        'render',
        'onRouteChange',
      ],
    });
    api.writeTmpFile({
      noPluginDir: true,
      path: join('core/loaders.ts'),
      tplPath: join(TEMPLATES_DIR, 'loaders.tpl'),
      context: {
        loaders: await getRouteClientLoaders(api),
      },
    });
    api.writeTmpFile({
      noPluginDir: true,
      path: join('server.ts'),
      tplPath: join(TEMPLATES_DIR, 'server.tpl'),
      context: {
        umiPath: resolve(require.resolve('umi'), '..'),
        routes: JSON.stringify(clonedRoutes, null, 2).replace(
          /"component": "await import\((.*)\)"/g,
          '"component": await import("$1")',
        ),
        routeLoaders: await getRouteLoaders(api),
        pluginPath: resolve(require.resolve('umi'), '../client/plugin.js'),
        rendererPath,
        validKeys,
      },
    });
  });

  api.onBeforeCompiler(async () => {
    await esbuild.build({
      format: 'cjs',
      platform: 'browser',
      target: 'esnext',
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
      logLevel: 'error',
      external: ['umi'],
      entryPoints: [resolve(api.paths.absTmpPath, 'server.ts')],
      plugins: [esbuildIgnorePathPrefixPlugin(), esbuildUmiPlugin(api)],
      outfile: resolve(api.paths.cwd, 'server/umi.server.js'),
    });
  });
};
