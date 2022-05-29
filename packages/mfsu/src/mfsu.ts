import { parseModule } from '@umijs/bundler-utils';
import type {
  NextFunction,
  Request,
  Response,
} from '@umijs/bundler-utils/compiled/express';
import { lodash, logger, tryPaths, winPath } from '@umijs/utils';
import assert from 'assert';
import { readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import webpack, { Configuration } from 'webpack';
import { lookup } from '../compiled/mrmime';
// @ts-ignore
import WebpackVirtualModules from '../compiled/webpack-virtual-modules';
import awaitImport from './babelPlugins/awaitImport/awaitImport';
import { getAliasedPathWithLoopDetect } from './babelPlugins/awaitImport/getAliasedPath';
import { getRealPath } from './babelPlugins/awaitImport/getRealPath';
import mfImport from './babelPlugins/awaitImport/MFImport';

import {
  DEFAULT_MF_NAME,
  DEFAULT_TMP_DIR_NAME,
  MF_DEP_PREFIX,
  MF_STATIC_PREFIX,
  MF_VA_PREFIX,
  REMOTE_FILE,
  REMOTE_FILE_FULL,
} from './constants';
import { Dep } from './dep/dep';
import { DepBuilder } from './depBuilder/depBuilder';
import { DepInfo, DepModule } from './depInfo';
import getAwaitImportHandler from './esbuildHandlers/awaitImport';
import { StaticDepInfo } from './staticDepInfo/staticDepInfo';
import { Mode } from './types';
import { makeArray } from './utils/makeArray';
import {
  BuildDepPlugin,
  IBuildDepPluginOpts,
} from './webpackPlugins/buildDepPlugin';

interface IOpts {
  cwd?: string;
  excludeNodeNatives?: boolean;
  exportAllMembers?: Record<string, string[]>;
  getCacheDependency?: Function;
  onMFSUProgress?: Function;
  mfName?: string;
  mode?: Mode;
  tmpBase?: string;
  unMatchLibs?: string[];
  runtimePublicPath?: boolean | string;
  implementor: typeof webpack;
  buildDepWithESBuild?: boolean;
  depBuildConfig: any;
  absSrcPath: string;
  version?: 'v4' | 'v3';
}

export class MFSU {
  public opts: IOpts;
  public alias: Record<string, string> = {};
  public externals: (Record<string, string> | Function)[] = [];
  public depBuilder: DepBuilder;
  public depConfig: Configuration | null = null;
  public buildDepsAgain: boolean = false;
  public progress: any = { done: false };
  public onProgress: Function;
  public publicPath: string = '/';
  private strategy: IMFSUStrategy;

  constructor(opts: IOpts) {
    this.opts = opts;
    this.opts.mfName = this.opts.mfName || DEFAULT_MF_NAME;
    this.opts.tmpBase =
      this.opts.tmpBase || join(process.cwd(), DEFAULT_TMP_DIR_NAME);
    this.opts.mode = this.opts.mode || Mode.development;
    this.opts.getCacheDependency = this.opts.getCacheDependency || (() => ({}));
    this.onProgress = (progress: any) => {
      this.progress = {
        ...this.progress,
        ...progress,
      };
      this.opts.onMFSUProgress?.(this.progress);
    };
    this.opts.cwd = this.opts.cwd || process.cwd();

    if (this.opts.version === 'v4') {
      this.strategy = new StaticAnalyzeStrategy({ mfsu: this });
    } else {
      this.strategy = new RuntimeStrategy({ mfsu: this });
    }

    this.strategy.loadCache();

    this.depBuilder = new DepBuilder({ mfsu: this });
  }

  async init() {
    await this.strategy.init();
  }

  // swc don't support top-level await
  // ref: https://github.com/vercel/next.js/issues/31054
  asyncImport(content: string) {
    return `await import('${winPath(content)}');`;
    // return `(async () => await import('${content}'))();`;
  }

  async setWebpackConfig(opts: {
    config: Configuration;
    depConfig: Configuration;
  }) {
    const { mfName } = this.opts;

    /**
     * config
     */
    // set alias and externals with reference for babel plugin
    Object.assign(this.alias, opts.config.resolve?.alias || {});
    this.externals.push(...makeArray(opts.config.externals || []));
    // entry
    const entry: Record<string, string> = {};
    const virtualModules: Record<string, string> = {};
    // ensure entry object type
    const entryObject = lodash.isString(opts.config.entry)
      ? { default: [opts.config.entry] }
      : (opts.config.entry as Record<string, string[]>);
    assert(
      lodash.isPlainObject(entryObject),
      `webpack config 'entry' value must be a string or an object.`,
    );
    for (const key of Object.keys(entryObject)) {
      const virtualPath = `./mfsu-virtual-entry/${key}.js`;
      const virtualContent: string[] = [];
      let index = 1;
      let hasDefaultExport = false;
      const entryFiles = lodash.isArray(entryObject[key])
        ? entryObject[key]
        : ([entryObject[key]] as unknown as string[]);
      for (let entry of entryFiles) {
        // ensure entry is a file
        if (statSync(entry).isDirectory()) {
          const realEntry = tryPaths([
            join(entry, 'index.tsx'),
            join(entry, 'index.ts'),
          ]);
          assert(
            realEntry,
            `entry file not found, please configure the specific entry path. (e.g. 'src/index.tsx')`,
          );
          entry = realEntry;
        }
        const content = readFileSync(entry, 'utf-8');
        const [_imports, exports] = await parseModule({ content, path: entry });
        if (exports.length) {
          virtualContent.push(`const k${index} = ${this.asyncImport(entry)}`);
          for (const exportName of exports) {
            if (exportName === 'default') {
              hasDefaultExport = true;
              virtualContent.push(`export default k${index}.${exportName}`);
            } else {
              virtualContent.push(
                `export const ${exportName} = k${index}.${exportName}`,
              );
            }
          }
        } else {
          virtualContent.push(this.asyncImport(entry));
        }
        index += 1;
      }
      if (!hasDefaultExport) {
        virtualContent.push(`export default 1;`);
      }
      virtualModules[virtualPath] = virtualContent.join('\n');
      entry[key] = virtualPath;
    }
    opts.config.entry = entry;
    // plugins
    opts.config.plugins = opts.config.plugins || [];

    // support publicPath auto
    let publicPath = opts.config.output!.publicPath;
    if (publicPath === 'auto') {
      publicPath = '/';
    }
    this.publicPath = publicPath as string;

    opts.config.plugins!.push(
      ...[
        new WebpackVirtualModules(virtualModules),
        new this.opts.implementor.container.ModuleFederationPlugin({
          name: '__',
          remotes: {
            [mfName!]: this.opts.runtimePublicPath
              ? // ref:
                // https://webpack.js.org/concepts/module-federation/#promise-based-dynamic-remotes
                `
promise new Promise(resolve => {
  const remoteUrlWithVersion = (window.publicPath || '/') + '${REMOTE_FILE_FULL}';
  const script = document.createElement('script');
  script.src = remoteUrlWithVersion;
  script.onload = () => {
    // the injected script has loaded and is available on window
    // we can now resolve this Promise
    const proxy = {
      get: (request) => window['${mfName}'].get(request),
      init: (arg) => {
        try {
          return window['${mfName}'].init(arg);
        } catch(e) {
          console.log('remote container already initialized');
        }
      }
    }
    resolve(proxy);
  }
  // inject this script with the src set to the versioned remoteEntry.js
  document.head.appendChild(script);
})
                `.trimLeft()
              : `${mfName}@${publicPath}${REMOTE_FILE_FULL}`,
          },
        }),
        new BuildDepPlugin(this.strategy.getBuildDepPlugConfig()),
        // new WriteCachePlugin({
        //   onWriteCache: lodash.debounce(() => {
        //     this.depInfo.writeCache();
        //   }, 300),
        // }),
      ],
    );

    // ensure topLevelAwait enabled
    lodash.set(opts.config, 'experiments.topLevelAwait', true);

    /**
     * depConfig
     */
    this.depConfig = opts.depConfig;
  }

  async buildDeps() {
    const shouldBuild = this.strategy.shouldBuild();
    if (!shouldBuild) {
      logger.info('MFSU skip buildDeps');
      return;
    }

    const staticDeps = this.strategy.getDepModules();

    const deps = Dep.buildDeps({
      deps: staticDeps,
      cwd: this.opts.cwd!,
      mfsu: this,
    });
    logger.info(`MFSU buildDeps since ${shouldBuild}`);
    logger.debug(deps.map((dep) => dep.file).join(', '));

    await this.depBuilder.build({
      deps,
    });

    // Snapshot after compiled success
    this.strategy.snapshot();

    // Write cache
    this.strategy.writeCache();

    if (this.buildDepsAgain) {
      logger.info('MFSU buildDepsAgain');
      this.buildDepsAgain = false;
      this.buildDeps().catch((e) => {
        logger.error(e);
      });
    }
  }

  getMiddlewares() {
    return [
      (req: Request, res: Response, next: NextFunction) => {
        const publicPath = this.publicPath;
        const isMF =
          req.path.startsWith(`${publicPath}${MF_VA_PREFIX}`) ||
          req.path.startsWith(`${publicPath}${MF_DEP_PREFIX}`) ||
          req.path.startsWith(`${publicPath}${MF_STATIC_PREFIX}`);
        if (isMF) {
          this.depBuilder.onBuildComplete(() => {
            if (!req.path.includes(REMOTE_FILE)) {
              res.setHeader('cache-control', 'max-age=31536000,immutable');
            }
            res.setHeader(
              'content-type',
              lookup(extname(req.path)) || 'text/plain',
            );
            const relativePath = req.path.replace(
              new RegExp(`^${publicPath}`),
              '/',
            );
            const content = readFileSync(
              join(this.opts.tmpBase!, relativePath),
            );
            res.send(content);
          });
        } else {
          next();
        }
      },
    ];
  }

  getBabelPlugins() {
    return [this.strategy.getBabelPlugin()];
  }

  getEsbuildLoaderHandler() {
    if (this.opts.version === 'v4') {
      console.log('MFSU v4 not supported esbuild');
      throw Error('MFSU v4 not supported esbuild');
    }

    const cache = new Map<string, any>();
    const checkOpts = this.strategy.getBabelPlugin()[1];

    return [
      getAwaitImportHandler({
        cache,
        opts: checkOpts,
      }),
    ] as any[];
  }

  public getCacheFilePath() {
    return this.strategy.getCacheFilePath();
  }
}

interface IMFSUStrategy {
  init(): Promise<void>;

  shouldBuild(): string | boolean;

  getBabelPlugin(): any[];

  getBuildDepPlugConfig(): IBuildDepPluginOpts;

  loadCache(): void;

  getCacheFilePath(): string;

  getDepModules(): Record<string, DepModule>;

  snapshot(): void;

  writeCache(): void;
}

class StaticAnalyzeStrategy implements IMFSUStrategy {
  private readonly mfsu: MFSU;
  private staticDepInfo: StaticDepInfo;

  constructor({ mfsu }: { mfsu: MFSU }) {
    this.mfsu = mfsu;
    const opts = mfsu.opts;

    this.staticDepInfo = new StaticDepInfo({
      mfsu,
      cachePath: join(opts.tmpBase!, 'v4'),
      absSrcPath: opts.absSrcPath,
    });
  }

  getDepModules() {
    return this.staticDepInfo.getDepModules();
  }

  getCacheFilePath(): string {
    return this.staticDepInfo.getCacheFilePath();
  }

  shouldBuild() {
    return this.staticDepInfo.shouldBuild();
  }

  writeCache() {
    this.staticDepInfo.writeCache();
  }

  getBabelPlugin(): any[] {
    return [mfImport, this.getMfImportOpts()];
  }

  private getMfImportOpts() {
    const mfsu = this.mfsu;
    const mfsuOpts = this.mfsu.opts;
    return {
      resolveImportSource: (source: string) => {
        const depMat = this.staticDepInfo.getDependencies();

        const r = getAliasedPathWithLoopDetect({
          value: source,
          alias: mfsu.alias,
        });
        const m = depMat[r];

        if (m) {
          return m.replaceValue;
        }

        return r;
      },
      exportAllMembers: mfsuOpts.exportAllMembers,
      unMatchLibs: mfsuOpts.unMatchLibs,
      remoteName: mfsuOpts.mfName,
      alias: mfsu.alias,
      externals: mfsu.externals,
    };
  }

  getBuildDepPlugConfig(): IBuildDepPluginOpts {
    const mfsu = this.mfsu;
    return {
      onFileChange: async (c) => {
        const mfiles = c.modifiedFiles; // abs paths
        const rfiles = c.removedFiles; // abs paths

        console.log({ mfiles, rfiles });
        await this.staticDepInfo.handleFileChanges({ mfiles, rfiles });
      },
      beforeCompile: async () => {
        console.log('new mfsu dep is building');
        if (mfsu.depBuilder.isBuilding) {
          mfsu.buildDepsAgain = true;
        } else {
          mfsu
            .buildDeps()
            .then(() => {
              mfsu.onProgress({
                done: true,
              });
            })
            .catch((e: Error) => {
              logger.error(e);
              mfsu.onProgress({
                done: true,
              });
            });
        }
      },
      onCompileDone: () => {
        // fixme if mf module finished earlier
      },
    };
  }

  init(): Promise<void> {
    return this.staticDepInfo.init();
  }

  loadCache() {
    this.staticDepInfo.loadCache();
  }

  snapshot() {
    this.staticDepInfo.snapshot();
  }
}

class RuntimeStrategy implements IMFSUStrategy {
  private readonly mfsu: MFSU;
  private depInfo: DepInfo;

  constructor({ mfsu }: { mfsu: MFSU }) {
    this.mfsu = mfsu;
    this.depInfo = new DepInfo({ mfsu });
  }

  getDepModules(): Record<string, DepModule> {
    return this.depInfo.getDepModules();
  }

  getCacheFilePath(): string {
    return this.depInfo.getCacheFilePath();
  }

  async init(): Promise<void> {}

  shouldBuild() {
    return this.depInfo.shouldBuild();
  }

  loadCache() {
    this.depInfo.loadCache();
  }

  writeCache() {
    this.depInfo.writeCache();
  }

  snapshot() {
    this.depInfo.snapshot();
  }

  getBabelPlugin(): any[] {
    return [awaitImport, this.getAwaitImportCollectOpts()];
  }

  getBuildDepPlugConfig(): IBuildDepPluginOpts {
    const mfsu = this.mfsu;

    return {
      onCompileDone: () => {
        if (mfsu.depBuilder.isBuilding) {
          mfsu.buildDepsAgain = true;
        } else {
          mfsu
            .buildDeps()
            .then(() => {
              mfsu.onProgress({
                done: true,
              });
            })
            .catch((e: Error) => {
              logger.error(e);
              mfsu.onProgress({
                done: true,
              });
            });
        }
      },
    };
  }

  private getAwaitImportCollectOpts() {
    const mfsuOpts = this.mfsu.opts;
    const mfsu = this.mfsu;

    return {
      onTransformDeps: () => {},
      onCollect: ({
        file,
        data,
      }: {
        file: string;
        data: {
          unMatched: Set<{ sourceValue: string }>;
          matched: Set<{ sourceValue: string }>;
        };
      }) => {
        this.depInfo.moduleGraph.onFileChange({
          file,
          // @ts-ignore
          deps: [
            ...Array.from(data.matched).map((item: any) => ({
              file: item.sourceValue,
              isDependency: true,
              version: Dep.getDepVersion({
                dep: item.sourceValue,
                cwd: mfsuOpts.cwd!,
              }),
            })),
            ...Array.from(data.unMatched).map((item: any) => ({
              file: getRealPath({
                file,
                dep: item.sourceValue,
              }),
              isDependency: false,
            })),
          ],
        });
      },
      exportAllMembers: mfsuOpts.exportAllMembers,
      unMatchLibs: mfsuOpts.unMatchLibs,
      remoteName: mfsuOpts.mfName,
      alias: mfsu.alias,
      externals: mfsu.externals,
    };
  }
}
