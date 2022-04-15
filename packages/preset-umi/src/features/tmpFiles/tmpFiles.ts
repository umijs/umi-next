import { parseModule } from '@umijs/bundler-utils';
import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import {
  BrowserRouteModulePlugin,
  IgnorePathPrefixPlugin,
  loaders,
} from '@umijs/bundler-utils/dist/esbuild';
import { lodash, winPath } from '@umijs/utils';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { basename, dirname, isAbsolute, join, resolve } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { getRouteLoaders } from '../ssr/utils';
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
    const rendererPath = winPath(
      await api.applyPlugins({
        key: 'modifyRendererPath',
        initialValue: require.resolve('@umijs/renderer-react'),
      }),
    );

    // umi.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        mountElementId: api.config.mountElementId,
        rendererPath,
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
            initialValue: [
              api.appData.globalCSS.length && {
                source: api.appData.globalCSS[0],
              },
              api.appData.globalJS.length && {
                source: api.appData.globalJS[0],
              },
            ].filter(Boolean),
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
        loadingComponent:
          existsSync(join(api.paths.absSrcPath, 'loading.tsx')) ||
          existsSync(join(api.paths.absSrcPath, 'loading.jsx')) ||
          existsSync(join(api.paths.absSrcPath, 'loading.js')),
        hydrate: !!api.config.ssr,
      },
    });

    // EmptyRoutes.tsx
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/EmptyRoute.tsx',
      content: `
import { Outlet } from 'umi';
export default function EmptyRoute() {
  return <Outlet />;
}
      `,
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
    const pages = basename(
      api.config.conventionRoutes?.base || api.paths.absPagesPath,
    );
    const prefix = hasSrc ? `../../../src/${pages}/` : `../../${pages}/`;
    const clonedRoutes = lodash.cloneDeep(routes);
    for (const id of Object.keys(clonedRoutes)) {
      const exports = await getExports({
        path: join(api.paths.absPagesPath, clonedRoutes[id].file),
      });
      clonedRoutes[id].hasLoader = exports.includes('loader');
      if (exports.includes('clientLoader'))
        clonedRoutes[id].loader = `clientLoaders.${
          id.replace('/', '_') + '_client_loader'
        }`;
      for (const key of Object.keys(clonedRoutes[id])) {
        if (key.startsWith('__') || key.startsWith('absPath')) {
          delete clonedRoutes[id][key];
        }
      }
    }
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/route.tsx',
      tplPath: join(TEMPLATES_DIR, 'route.tpl'),
      context: {
        routes: JSON.stringify(clonedRoutes).replace(
          /"(clientLoaders\..*?)"/g,
          '$1',
        ),
        routeComponents: await getRouteComponents({ api, routes, prefix }),
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

    // history.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/history.ts',
      tplPath: join(TEMPLATES_DIR, 'history.tpl'),
      context: {
        rendererPath,
      },
    });

    // loaders.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: join('core/loaders.ts'),
      tplPath: join(TEMPLATES_DIR, 'loaders.tpl'),
      context: {
        loaders: await getRouteLoaders(api, 'clientLoader'),
      },
    });

    // server.ts
    if (api.config.ssr) {
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
          routeLoaders: await getRouteLoaders(api, 'loader'),
          pluginPath: resolve(require.resolve('umi'), '../client/plugin.js'),
          rendererPath: join(dirname(rendererPath), 'server.js'),
          umiServerPath: resolve(require.resolve('@umijs/server'), '../ssr.js'),
          validKeys,
        },
      });
    }
  });

  async function getExports(opts: { path: string }) {
    try {
      const content = readFileSync(opts.path, 'utf-8');
      const [_, exports] = await parseModule({ content, path: opts.path });
      return exports || [];
    } catch (err) {
      return [];
    }
  }

  function checkMembers(opts: {
    path: string;
    members: string[];
    exportMembers: string[];
  }) {
    const conflicts = lodash.intersection(opts.exportMembers, opts.members);
    if (conflicts.length) {
      throw new Error(
        `Conflict members: ${conflicts.join(', ')} in ${opts.path}`,
      );
    }
  }

  async function getExportsAndCheck(opts: {
    path: string;
    exportMembers: string[];
  }) {
    const members = (await getExports(opts)) as string[];
    checkMembers({
      members,
      exportMembers: opts.exportMembers,
      path: opts.path,
    });
    opts.exportMembers.push(...members);
    return members;
  }

  const isPluginDocsEnable =
    api.userConfig.plugins?.includes('@umijs/plugin-docs');
  if (!isPluginDocsEnable) {
    // Pack the route component **without loaders** into tmpDir/pages
    // These generated route components will be imported by core/route.tsx
    api.onBeforeCompiler(async () => {
      const routes = api.appData.routes;
      const entryPoints: { [key: string]: string } = {};
      Object.keys(routes).map((key) => {
        if (isAbsolute(routes[key].file)) {
          entryPoints[routes[key].id.replace(/\//g, '_')] = join(
            routes[key].file + '?browser',
          );
          return;
        }
        entryPoints[routes[key].id.replace(/\//g, '_')] = join(
          api.paths.absPagesPath,
          routes[key].file + '?browser',
        );
      });
      await esbuild.build({
        entryPoints,
        format: 'esm',
        splitting: true,
        bundle: true,
        external: ['umi', 'react', 'react-dom'],
        outdir: join(api.paths.absTmpPath, 'pages'),
        entryNames: '[name]',
        chunkNames: '_shared/[name]-[hash]',
        loader: loaders,
        plugins: [
          IgnorePathPrefixPlugin(),
          BrowserRouteModulePlugin(),
          // 在预编译阶段，静态文件直接替换成绝对路径并表示为 external，因为在构建客户端产物的
          // 流程中，实际的文件加载是由下一步的 webpack 负责的
          {
            name: 'assets',
            setup(build) {
              build.onResolve(
                { filter: /\.(css|less|svg|png|jpg)$/ },
                (args) => {
                  return {
                    path: resolve(args.resolveDir, args.path),
                    external: true,
                  };
                },
              );
            },
          },
        ],
      });
    });
  }

  // Generate @@/exports.ts
  api.register({
    key: 'onGenerateFiles',
    fn: async () => {
      const exports = [];
      const exportMembers = ['default'];
      // @umijs/renderer-react
      exports.push('// @umijs/renderer-react');
      const rendererReactPath = winPath(
        require.resolve('@umijs/renderer-react'),
      );
      exports.push(
        `export { ${(
          await getExportsAndCheck({
            path: join(rendererReactPath),
            exportMembers,
          })
        ).join(', ')} } from '${rendererReactPath}';`,
      );
      // umi/client/client/plugin
      exports.push('// umi/client/client/plugin');
      const umiDir = process.env.UMI_DIR!;
      const umiPluginPath = winPath(join(umiDir, 'client/client/plugin.js'));
      exports.push(
        `export { ${(
          await getExportsAndCheck({
            path: umiPluginPath,
            exportMembers,
          })
        ).join(', ')} } from '${umiPluginPath}';`,
      );
      // @@/core/history.ts
      exports.push(`export { history, createHistory } from './core/history';`);
      checkMembers({
        members: ['history', 'createHistory'],
        exportMembers,
        path: '@@/core/history.ts',
      });
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
        const pluginExports = await getExportsAndCheck({
          path: file!,
          exportMembers,
        });
        if (pluginExports.length) {
          exports.push(
            `export { ${pluginExports.join(', ')} } from '${winPath(
              join(api.paths.absTmpPath, plugin),
            )}';`,
          );
        }
      }
      // plugins types.ts
      exports.push('// plugins types.d.ts');
      for (const plugin of plugins) {
        const file = winPath(join(api.paths.absTmpPath, plugin, 'types.d.ts'));
        if (existsSync(file)) {
          // 带 .ts 后缀的声明文件 会导致声明失效
          const noSuffixFile = file.replace(/\.ts$/, '');
          exports.push(`export * from '${noSuffixFile}';`);
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
