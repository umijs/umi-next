import {
  ImportSpecifier,
  init,
  parse,
} from '@umijs/bundler-utils/compiled/es-module-lexer';
import { build as esBuild } from '@umijs/bundler-utils/compiled/esbuild';
import { fsExtra, lodash, logger } from '@umijs/utils';
import { watch } from 'chokidar';
import fg from 'fast-glob';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, extname, join, relative } from 'path';
import { checkMatch } from '../babelPlugins/awaitImport/checkMatch';
import { Dep } from '../dep/dep';
import { MFSU } from '../mfsu/mfsu';
import handleBabelPluginImport from './simulations/babel-plugin-import';

interface IOpts {
  mfsu: MFSU;
  absSrcPath: string;
  cachePath: string;
  preDeps?: string[];
}

export type Match = ReturnType<typeof checkMatch> & { version: string };

type FileChangeEvent = { event: 'unlink' | 'change'; path: string };

type Matched = Record<string, Match>;

export class StaticDepInfo {
  private opts: IOpts;
  private readonly cacheFilePath: string;
  private fileList: string[] = [];
  private readonly srcPath: string;
  private readonly cachePath: string;

  private fileContentCache: Record<string, string> = {};
  private mfsu: MFSU;
  private readonly safeList: string[];
  private currentDep: Record<string, Match> = {};
  private _snapshot: Record<string, Match> = {};

  public readonly debouchedHandleChanges: () => Promise<void> | undefined;

  pendingChanges: FileChangeEvent[] = [];
  private produced: { changes: FileChangeEvent[] }[] = [];
  private readonly cwd: string;
  private readonly runtimeSimulations: {
    packageName: string;
    handleImports: <T>(
      opts: {
        imports: ImportSpecifier[];
        rawCode: string;
        mfName: string;
        alias: Record<string, string>;
        pathToVersion(p: string): string;
      },
      handleConfig?: T,
    ) => Match[];
  }[];

  constructor(opts: IOpts) {
    this.srcPath = opts.absSrcPath;
    this.cachePath = opts.cachePath;
    this.mfsu = opts.mfsu;

    console.log('caching at ', opts.cachePath);
    this.safeList = opts.preDeps || [
      'react',
      'react-error-overlay',
      'react/jsx-dev-runtime',
      '@umijs/utils/compiled/strip-ansi',
    ];

    this.opts = opts;
    this.cacheFilePath = join(
      this.opts.mfsu.opts.tmpBase!,
      'MFSU_CACHE_v4.json',
    );

    this.cwd = this.mfsu.opts.cwd!;
    this.runtimeSimulations = [
      {
        packageName: 'antd',
        handleImports: handleBabelPluginImport,
      },
    ];

    this.debouchedHandleChanges = lodash.debounce(this.handleEvents, 500);
  }

  getProducedEvent() {
    return this.produced;
  }

  consumeAllProducedEvents() {
    this.produced = [];
  }

  private handleEvents = async () => {
    const modifiedFiles = [];
    const handledEvents = [];

    while (this.pendingChanges.length > 0) {
      const c = this.pendingChanges.pop()!;
      handledEvents.push(c);

      if (c.event === 'unlink') {
        console.log('unlink ', c.path);
        delete this.fileContentCache[c.path];
      }
      if (c.event === 'change') {
        modifiedFiles.push(c.path);
      }
    }

    await this.batchProcess(modifiedFiles);
    for (const f of modifiedFiles) {
      let newFile = join(this.cachePath, relative(this.srcPath, f));

      // fixme ensure the last one
      newFile = newFile.replace(extname(newFile), '.js');

      const c = readFileSync(newFile, 'utf-8');
      console.log(f);
      this.fileContentCache[f] = c;
    }

    this.currentDep = this._getDependencies();

    this.produced.push({
      changes: handledEvents,
    });
  };

  async init() {
    console.time('fast-glob');
    const files = await fg(join(this.srcPath, '**', '*.{ts,js,jsx,tsx}'), {
      dot: true,
      ignore: [
        '**/*.d.ts',
        '**/*.test.{js,ts,jsx,tsx}',
        // fixme respect to environment
        '**/.umi-production/**',
        '**/node_modules/**',
        '**/.git/**',
      ],
    });
    console.timeEnd('fast-glob');

    console.time('chodidar');
    const dirWatcher = watch('./**/*.{ts,js,jsx,tsx}', {
      ignored: [
        '**/*.d.ts',
        '**/*.test.{js,ts,jsx,tsx}',
        // fixme respect to environment
        '**/.umi-production/**',
        '**/node_modules/**',
        '**/.git/**',
      ],
      cwd: this.srcPath,
      ignoreInitial: true,
      ignorePermissionErrors: true,
    });

    const p = new Promise<void>((resolve) => {
      dirWatcher.on('ready', () => {
        resolve();
      });
    });
    await p;
    console.timeEnd('chodidar'); // it seems chodidar is faster than fast-glob

    dirWatcher.on('all', (event, path) => {
      switch (event) {
        case 'change':
        case 'add':
          this.pendingChanges.push({
            event: 'change',
            path: join(this.srcPath, path),
          });
          this.debouchedHandleChanges();
          break;
        case 'unlink':
          this.pendingChanges.push({
            event: 'unlink',
            path: join(this.srcPath, path),
          });
          this.debouchedHandleChanges();
          break;
        default:
        // ignore all others;
      }
    });

    await init;

    this.fileList = files;

    await this.batchProcess(this.fileList);

    for (const f of this.fileList) {
      let newFile = join(this.cachePath, relative(this.srcPath, f));

      // fixme ensure the last one
      newFile = newFile.replace(extname(newFile), '.js');

      this.fileContentCache[f] = readFileSync(newFile, 'utf-8');
    }

    this.currentDep = await this._getDependencies();
  }

  shouldBuild() {
    if (lodash.isEqual(this._snapshot, this.currentDep)) {
      return false;
    } else {
      return 'dependencies changed';
    }
  }

  getDepModules() {
    const map = this.getDependencies();

    const staticDeps: Record<string, { file: string; version: string }> = {};
    const keys = Object.keys(map);
    for (const k of keys) {
      staticDeps[k] = {
        file: k,
        version: map[k].version,
      };
    }

    return staticDeps;
  }

  snapshot() {
    this._snapshot = this.currentDep = this._getDependencies();
  }

  loadCache() {
    if (existsSync(this.cacheFilePath)) {
      this._snapshot = JSON.parse(readFileSync(this.cacheFilePath, 'utf-8'));
      logger.info('MFSU v4 restored cache');
    }
  }

  writeCache() {
    fsExtra.mkdirpSync(dirname(this.cacheFilePath));
    const newContent = JSON.stringify(this._snapshot, null, 2);
    if (
      existsSync(this.cacheFilePath) &&
      readFileSync(this.cacheFilePath, 'utf-8') === newContent
    ) {
      return;
    }

    logger.info('MFSU v4 write cache');
    writeFileSync(this.cacheFilePath, newContent, 'utf-8');
  }

  public getCacheFilePath() {
    return this.cacheFilePath;
  }

  public getDependencies() {
    return this.currentDep;
  }

  private _getDependencies(): Record<string, Match> {
    console.time('_getDependencies');

    const cwd = this.mfsu.opts.cwd!;

    const bigCodeString = Object.keys(this.fileContentCache)
      .map((k) => this.fileContentCache[k])
      .join('\n');

    const [imports] = parse(bigCodeString);

    const opts = {
      exportAllMembers: this.mfsu.opts.exportAllMembers,
      unMatchLibs: this.mfsu.opts.unMatchLibs,
      remoteName: this.mfsu.opts.mfName,
      alias: this.mfsu.alias,
      externals: this.mfsu.externals,
    };

    const matched: Record<string, Match> = {};
    const unMatched = new Set<string>();

    const pkgNames = this.runtimeSimulations.map(
      ({ packageName }) => packageName,
    );
    const groupedMockImports: Record<string, ImportSpecifier[]> = {};

    for (const imp of imports) {
      if (pkgNames.indexOf(imp.n!) >= 0) {
        const name = imp.n!;
        if (groupedMockImports[name]) {
          groupedMockImports[name].push(imp);
        } else {
          groupedMockImports[name] = [imp];
        }
        continue;
      }

      if (unMatched.has(imp.n!)) {
        continue;
      }

      if (matched[imp.n!]) {
        continue;
      }

      const match = checkMatch({
        value: imp.n as string,
        depth: 1,
        filename: '_.js',
        opts,
      });

      if (match.isMatch) {
        matched[match.value] = {
          ...match,
          version: Dep.getDepVersion({
            dep: match.value,
            cwd,
          }),
        };
      } else {
        unMatched.add(imp.n!);
      }
    }

    this.simulateRuntimeTransform(matched, groupedMockImports, bigCodeString);

    this.appendSafeList(matched, opts);

    console.timeEnd('_getDependencies');
    return matched;
  }

  private simulateRuntimeTransform(
    matched: Matched,
    groupedImports: Record<string, ImportSpecifier[]>,
    rawCode: string,
  ) {
    for (const mock of this.runtimeSimulations) {
      const name = mock.packageName;

      const pathToVersion = (dep: string) => {
        return Dep.getDepVersion({
          dep,
          cwd: this.cwd,
        });
      };

      const ms = mock.handleImports({
        imports: groupedImports[name],
        rawCode,
        alias: this.mfsu.alias,
        mfName: this.mfsu.opts.mfName!,
        pathToVersion,
      });

      for (const m of ms) {
        matched[m.value] = m;
      }
    }
  }

  private appendSafeList(matched: Matched, opts: any) {
    for (const p of this.safeList) {
      const match = checkMatch({
        value: p,
        depth: 1,
        filename: '_.js',
        opts,
      });
      if (match.isMatch) {
        matched[match.value] = {
          ...match,
          version: Dep.getDepVersion({
            dep: match.value,
            cwd: this.cwd,
          }),
        };
      }
    }
  }

  async batchProcess(files: string[]) {
    try {
      await esBuild({
        entryPoints: files,
        bundle: false,
        outdir: this.cachePath,
        outbase: this.srcPath,
        loader: {
          // in case some js using some feature, eg: decorator
          '.jsx': 'tsx',
        },
        logLevel: 'silent',
      });
    } catch (e) {
      // error ignored due to user have to update code to fix then trigger another batchProcess;

      // @ts-ignore
      if (e.errors?.length || e.warnings?.length) {
        logger.warn(
          'transpile code with esbuild got ',
          // @ts-ignore
          e.errors?.lenght || 0,
          'errors,',
          // @ts-ignore
          e.warnings?.length || 0,
          'warnings',
        );
        logger.debug('esbuild transpile code with error', e);
      } else {
        logger.warn('transpile code with esbuild error', e);
      }
    }
  }

  async allRuntimeHelpers() {
    // todo mfsu4
  }
}
