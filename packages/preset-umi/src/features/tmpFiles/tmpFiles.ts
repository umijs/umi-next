import { parseModule } from '@umijs/bundler-utils';
import { winPath } from '@umijs/utils';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { importsToStr } from './importsToStr';
import { getRouteComponents, getRoutes } from './routes';

export default (api: IApi) => {
  api.describe({
    key: 'tmpFiles',
    config: {
      schema(Joi) {
        return Joi.boolean();
      },
    },
  });

  api.onGenerateFiles(async (opts) => {
    // umi.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        mountElementId: api.config.mountElementId,
        rendererPath: await api.applyPlugins({
          key: 'modifyRendererPath',
          initialValue: dirname(
            require.resolve('@umijs/renderer-react/package.json'),
          ),
        }),
        entryCode: (
          await api.applyPlugins({
            key: 'addEntryCode',
            initialValue: [],
          })
        ).join('\n'),
        entryCodeAhead: (
          await api.applyPlugins({
            key: 'addEntryCodeAhead',
            initialValue: [],
          })
        ).join('\n'),
        polyfillImports: importsToStr(
          await api.applyPlugins({
            key: 'addPolyfillImports',
            initialValue: [],
          }),
        ).join('\n'),
        importsAhead: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImportsAhead',
            initialValue: [],
          }),
        ).join('\n'),
        imports: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImports',
            initialValue: [],
          }),
        ).join('\n'),
        basename: api.config.base,
        historyType: api.config.history.type,
      },
    });

    // route.ts
    let routes;
    if (opts.isFirstTime) {
      routes = api.appData.routes;
    } else {
      routes = await getRoutes({
        api,
      });
    }
    const hasSrc = api.appData.hasSrcDir;
    // @/pages/
    const prefix = hasSrc ? '../../../src/pages/' : '../../pages/';
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/route.tsx',
      tplPath: join(TEMPLATES_DIR, 'route.tpl'),
      context: {
        routes: JSON.stringify(routes),
        routeComponents: await getRouteComponents({ routes, prefix }),
      },
    });

    // plugin.ts
    const plugins: string[] = await api.applyPlugins({
      key: 'addRuntimePlugin',
      initialValue: [
        // TODO: add tryFiles in @umijs/utils
        existsSync(join(api.paths.absSrcPath, 'app.ts')) &&
          join(api.paths.absSrcPath, 'app.ts'),
        existsSync(join(api.paths.absSrcPath, 'app.tsx')) &&
          join(api.paths.absSrcPath, 'app.tsx'),
        existsSync(join(api.paths.absSrcPath, 'app.jsx')) &&
          join(api.paths.absSrcPath, 'app.jsx'),
        existsSync(join(api.paths.absSrcPath, 'app.js')) &&
          join(api.paths.absSrcPath, 'app.js'),
      ]
        .filter(Boolean)
        .slice(0, 1),
    });
    const validKeys = await api.applyPlugins({
      key: 'addRuntimePluginKey',
      initialValue: [
        // TODO: support these methods
        // 'modifyClientRenderOpts',
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
      path: 'core/plugin.ts',
      tplPath: join(TEMPLATES_DIR, 'plugin.tpl'),
      context: {
        plugins: plugins.map((plugin, index) => ({
          index,
          path: winPath(plugin),
        })),
        validKeys: validKeys,
      },
    });
  });

  async function getExports(opts: { path: string }) {
    const content = readFileSync(opts.path, 'utf-8');
    const [_, exports] = await parseModule({ content, path: opts.path });
    return exports || [];
  }

  // Generate @@/exports.ts
  api.register({
    key: 'onGenerateFiles',
    fn: async () => {
      const exports = [];
      // @umijs/renderer-react
      exports.push('// @umijs/renderer-react');
      const rendererReactPath = dirname(
        require.resolve('@umijs/renderer-react/package.json'),
      );
      exports.push(
        `export { ${(
          await getExports({
            path: join(rendererReactPath, 'dist/index.js'),
          })
        ).join(', ')} } from '${rendererReactPath}';`,
      );
      // umi/client/client/plugin
      exports.push('// umi/client/client/plugin');
      const umiDir = process.env.UMI_DIR!;
      const umiPluginPath = join(umiDir, 'client/client/plugin.js');
      exports.push(
        `export { ${(
          await getExports({
            path: umiPluginPath,
          })
        ).join(', ')} } from '${umiPluginPath}';`,
      );
      // plugins
      exports.push('// plugins');
      const plugins = readdirSync(api.paths.absTmpPath).filter((file) => {
        if (
          file.startsWith('plugin-') &&
          (existsSync(join(api.paths.absTmpPath, file, 'index.ts')) ||
            existsSync(join(api.paths.absTmpPath, file, 'index.tsx')))
        ) {
          return true;
        }
      });
      for (const plugin of plugins) {
        let file: string;
        if (existsSync(join(api.paths.absTmpPath, plugin, 'index.ts'))) {
          file = join(api.paths.absTmpPath, plugin, 'index.ts');
        }
        if (existsSync(join(api.paths.absTmpPath, plugin, 'index.tsx'))) {
          file = join(api.paths.absTmpPath, plugin, 'index.tsx');
        }
        const pluginExports = await getExports({
          path: file!,
        });
        if (pluginExports.length) {
          exports.push(
            `export { ${pluginExports.join(', ')} } from '${join(
              api.paths.absTmpPath,
              plugin,
            )}';`,
          );
        }
      }
      api.writeTmpFile({
        noPluginDir: true,
        path: 'exports.ts',
        content: exports.join('\n'),
      });
    },
    stage: Infinity,
  });
};
