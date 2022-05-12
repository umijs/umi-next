import { parseModule } from '@umijs/bundler-utils';
import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { lodash, winPath } from '@umijs/utils';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { basename, dirname, isAbsolute, join, resolve } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi, IRoute } from '../../types';
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
        initialValue: dirname(
          require.resolve('@umijs/renderer-react/package.json'),
        ),
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
      for (const key of Object.keys(clonedRoutes[id])) {
        if (key.startsWith('__') || key.startsWith('absPath')) {
          delete clonedRoutes[id][key];
        }
        if (
          ['.js', '.jsx', '.ts', '.tsx'].some((ext) =>
            clonedRoutes[id].file.endsWith(ext),
          )
        ) {
          const exports = await getExports({
            path: isAbsolute(clonedRoutes[id].file)
              ? clonedRoutes[id].file
              : join(api.paths.absPagesPath, clonedRoutes[id].file),
          });
          clonedRoutes[id].hasLoader = exports.includes('loader');
          if (exports.includes('clientLoader'))
            clonedRoutes[id].clientLoader = `clientLoaders.${
              id.replace(/\//g, '_') + '_client_loader'
            }`;
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
        routeComponents: await getRouteComponents({ routes, prefix, api }),
      },
    });

    // loaders.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: join('core/loaders.ts'),
      tplPath: join(TEMPLATES_DIR, 'loaders.tpl'),
      context: {
        loaders: await getRouteClientLoaders(api),
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
        'patchRoutes',
        'patchClientRoutes',
        'modifyContextOpts',
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
  });

  // Pack the route component **without loaders** into tmpDir/pages
  // These generated route components will be imported by core/route.tsx
  api.onBeforeCompiler(async () => {
    const routes = api.appData.routes;
    const entryPoints: { [key: string]: string } = {};
    Object.keys(routes).map((key) => {
      let file = routes[key].file;
      // If route.file is relative path, convert it to absolute path
      if (!isAbsolute(file)) {
        file = join(api.paths.absPagesPath, routes[key].file);
      }
      // If route.file has extension, test if it's a [ts|tsx|js|jsx] file
      if (['.tsx', '.jsx', '.ts', '.js'].some((ext) => file.endsWith(ext))) {
        entryPoints[routes[key].id.replace(/\//g, '_')] = file + '?browser';
        return;
      }
      // If route.file doesn't have extension, test which extension it has
      ['.tsx', '.jsx', '.ts', '.js'].forEach((ext) => {
        const filePath = join(api.paths.absPagesPath, file + ext);
        if (existsSync(filePath)) {
          entryPoints[routes[key].id.replace(/\//g, '_')] =
            filePath + '?browser';
          return;
        }
      });
    });
    await esbuild.build({
      entryPoints,
      format: 'esm',
      splitting: true,
      bundle: true,
      watch: api.env === 'development',
      jsx: 'preserve',
      outdir: join(api.paths.absTmpPath, 'pages'),
      entryNames: '[name]',
      loader: loaders,
      chunkNames: '_shared/[name]-[hash]',
      plugins: [
        BrowserRouteModulePlugin(),
        {
          name: 'assets',
          setup(build) {
            build.onResolve({ filter: /.*/ }, (args) => {
              let path = args.path;
              if (args.path.startsWith('./') || args.path.startsWith('../'))
                path = resolve(args.resolveDir, args.path);
              return { path, external: !args.importer.endsWith('?browser') };
            });
          },
        },
      ],
    });
  });

  async function getExports(opts: { path: string }) {
    const content = readFileSync(opts.path, 'utf-8');
    const [_, exports] = await parseModule({ content, path: opts.path });
    return exports || [];
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

  // Generate @@/exports.ts
  api.register({
    key: 'onGenerateFiles',
    fn: async () => {
      const rendererPath = winPath(
        await api.applyPlugins({
          key: 'modifyRendererPath',
          initialValue: dirname(
            require.resolve('@umijs/renderer-react/package.json'),
          ),
        }),
      );

      const exports = [];
      const exportMembers = ['default'];
      // @umijs/renderer-react
      exports.push('// @umijs/renderer-*');

      exports.push(
        `export { ${(
          await getExportsAndCheck({
            path: join(rendererPath, 'dist/index.js'),
            exportMembers,
          })
        ).join(', ')} } from '${rendererPath}';`,
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
      // @@/core/terminal.ts
      if (api.service.config.terminal !== false) {
        exports.push(`export { terminal } from './core/terminal';`);
        checkMembers({
          members: ['terminal'],
          exportMembers,
          path: '@@/core/terminal.ts',
        });
      }
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

/**
 * Get exports of specific route module
 *
 * Example:
 * ```
 * // pages/index.tsx
 * export default function () { / * ... * / }
 * export function loader() { / * ... *  / }
 * export function clientLoader() { / * ... * / }
 * ```
 *
 * getRouteModuleExports(api, routes[index])
 * -> [ 'default', 'loader', 'clientLoader' ];
 * */
export async function getRouteModuleExports(
  api: IApi,
  route: IRoute,
): Promise<string[]> {
  try {
    let result = await esbuild.build({
      entryPoints: [join(api.paths.absPagesPath, route.file)],
      platform: 'neutral',
      format: 'esm',
      metafile: true,
      write: false,
      logLevel: 'silent',
    });
    let metafile = result.metafile!;
    for (let key in metafile.outputs) {
      let output = metafile.outputs[key];
      if (output.entryPoint) return output.exports;
    }
    return [];
  } catch (error) {
    return [];
  }
}

/**
 * Get the client/server loaders of routes (if exists)
 *
 * example result is:
 * ```
 * [
 *   { name: 'index_client_loader', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/index.tsx' },
 *   { name: 'users_client_loader', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/users.tsx' },
 *   { name: 'users_user_client_loader', path: '/Users/yuanlin/Developer/github.com/umijs/umi-next/examples/ssr-demo/src/pages/users/user.tsx' },
 * ];
 * ```
 * */
export async function getRouteClientLoaders(api: IApi) {
  const routesWithClientLoader: string[] = [];
  await Promise.all(
    Object.keys(api.appData.routes).map(async (key) => {
      const route = api.appData.routes[key];
      const exports = await getRouteModuleExports(api, route);
      if (exports.includes('clientLoader')) routesWithClientLoader.push(key);
    }),
  );
  return routesWithClientLoader.map((key) => {
    const route = api.appData.routes[key];
    const name = key.replace(/\//g, '_') + '_client_loader';
    return {
      name,
      path: join(api.paths.absPagesPath, route.file),
    };
  });
}

/**
 * 在 pre-compile 阶段，我们会使用 esbuild 来将页面代码 (例如 pages/index.tsx) 中，默认
 * 导出 (export default) 的页面组件及其依赖提取出来，而和页面组件无关的 (export loader,
 * export clientLoader) 等导出 (及其依赖) 则不需要。
 *
 * 这个 BrowserRouteModulesPlugin 能够让 esbuild 在 build 的时候，对于那些后面带有 ?browser 后缀
 * 的 entryPoints 进行路由组件的提取。
 * */
function BrowserRouteModulePlugin(): esbuild.Plugin {
  return {
    name: 'browser-route-modules',
    async setup(build) {
      build.onResolve({ filter: /\?browser$/ }, (args) => {
        return {
          path: args.path,
          namespace: 'browser-route-module',
        };
      });

      build.onLoad(
        { filter: /\?browser$/, namespace: 'browser-route-module' },
        async (args) => {
          let file = args.path.replace(/\?browser$/, '');
          let contents = `export { default } from ${JSON.stringify(file)};`;
          return {
            contents,
            resolveDir: dirname(file),
            loader: 'js',
          };
        },
      );
    },
  };
}

const loaders: { [ext: string]: esbuild.Loader } = {
  '.aac': 'file',
  '.css': 'text',
  '.less': 'text',
  '.sass': 'text',
  '.scss': 'text',
  '.eot': 'file',
  '.flac': 'file',
  '.gif': 'file',
  '.ico': 'file',
  '.jpeg': 'file',
  '.jpg': 'file',
  '.js': 'jsx',
  '.jsx': 'jsx',
  '.json': 'json',
  '.md': 'jsx',
  '.mdx': 'jsx',
  '.mp3': 'file',
  '.mp4': 'file',
  '.ogg': 'file',
  '.otf': 'file',
  '.png': 'file',
  '.svg': 'file',
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.ttf': 'file',
  '.wav': 'file',
  '.webm': 'file',
  '.webp': 'file',
  '.woff': 'file',
  '.woff2': 'file',
};
