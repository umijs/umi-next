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
import { getAliasedPathWithLoopDetect } from '../babelPlugins/awaitImport/getAliasedPath';
import { Dep } from '../dep/dep';
import { MFSU } from '../mfsu/mfsu';
import parseImport from './importParser';

interface IOpts {
  mfsu: MFSU;
  absSrcPath: string;
  cachePath: string;
  preDeps?: string[];
}

type Match = ReturnType<typeof checkMatch> & { version: string };

type FileChangeEvent = { event: 'unlink' | 'change'; path: string };

export class StaticDepInfo {
  private opts: IOpts;
  private readonly cacheFilePath: string;
  private fileList: string[] = [];
  private readonly srcPath: string;
  private readonly cachePath: string;

  private fileContentCache: Record<string, string> = {};
  private mfsu: MFSU;
  private readonly presetDep: string[];
  private currentDep: Record<string, Match> = {};
  private _snapshot: Record<string, Match> = {};

  public readonly debouchedHandleChanges: () => Promise<void> | undefined;

  pendingChanges: FileChangeEvent[] = [];
  private produced: { changes: FileChangeEvent[] }[] = [];

  constructor(opts: IOpts) {
    this.srcPath = opts.absSrcPath;
    this.cachePath = opts.cachePath;
    this.mfsu = opts.mfsu;

    console.log('caching at ', opts.cachePath);
    this.presetDep = opts.preDeps || [
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
      ],
      cwd: this.srcPath,
    });

    const p = new Promise<void>((resolve) => {
      dirWatcher.on('ready', () => {
        resolve();
      });
    });
    await p;
    console.timeEnd('chodidar'); // it seems chodidar is faster than fast-glob

    dirWatcher.on('all', (event, path) => {
      console.log('event', event, '-->', path);

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

      const c = readFileSync(newFile, 'utf-8');
      this.fileContentCache[f] = c;
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

    const antdImports: ImportSpecifier[] = [];
    for (const imp of imports) {
      if (imp.n === 'antd') {
        antdImports.push(imp);
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

    if (antdImports.length > 0) {
      const importSnippets = antdImports
        .map(({ ss, se }) => {
          return bigCodeString.slice(ss, se + 1);
        })
        .join('\n');

      const parsedImports = parseImport(importSnippets);

      const importedVariable = new Set<string>();

      for (const i of parsedImports) {
        i.imports.forEach((v) => {
          importedVariable.add(v);
        });
      }

      const mfName = this.mfsu.opts.mfName;
      const base = antdImports[0].n!;
      for (const v of importedVariable.entries()) {
        const dashed = toDash(v[0]);

        // fixme respect to config#antd
        const importBase = join(base, 'es', dashed);
        const componentPath = getAliasedPathWithLoopDetect({
          value: importBase,
          alias: this.mfsu.alias,
        });
        const styleImportPath = join(componentPath, 'style');

        const version = Dep.getDepVersion({
          dep: componentPath,
          cwd,
        });

        matched[componentPath] = {
          isMatch: true,
          value: componentPath,
          replaceValue: `${mfName}/${componentPath}`,
          version,
        };
        matched[styleImportPath] = {
          isMatch: true,
          value: styleImportPath,
          replaceValue: `${mfName}/${styleImportPath}`,
          version,
        };
      }
    }

    for (const p of this.presetDep) {
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
            cwd,
          }),
        };
      }
    }
    console.timeEnd('_getDependencies');
    return matched;
  }

  async batchProcess(files: string[]) {
    try {
      await esBuild({
        entryPoints: files,
        bundle: false,
        outdir: this.cachePath,
        outbase: this.srcPath,
      });
    } catch (e) {
      // error ignored due to user have to update code to fix then trigger another batchProcess;
      console.error(e);
    }
  }

  async allRuntimeHelpers() {
    // todo mfsu4
  }
}

const capitalLettersReg = /([A-Z])/g;

// https://github.com/node4good/lodash-contrib/blob/91dded5d52f6dca50a4c74782740b02478c2c548/common-js/_.util.strings.js#L104
function toDash(string: string): string {
  string = string.replace(capitalLettersReg, function ($1) {
    return '-' + $1.toLowerCase();
  });
  // remove first dash
  return string.charAt(0) == '-' ? string.substr(1) : string;
}
