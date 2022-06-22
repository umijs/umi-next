import {
  ImportSpecifier,
  init as esModuleLexerInit,
  parse,
} from '@umijs/bundler-utils/compiled/es-module-lexer';
import { build as esBuild } from '@umijs/bundler-utils/compiled/esbuild';
import * as logger from '../logger';
// @ts-ignore
import fg from 'fast-glob';
import { readFileSync } from 'fs';
import { extname, join, relative } from 'path';
import {
  AutoUpdateFolderCache,
  FileChangeEvent,
} from './AutoUpdateFolderCache';

export type MergedCodeInfo = {
  code: string;
  imports: readonly ImportSpecifier[];
};

export type Listener = (
  info: MergedCodeInfo,
  events: FileChangeEvent[],
) => void;

export class AutoUpdateSrcCodeCache {
  private readonly srcPath: string;
  private readonly cachePath: string;
  folderCache: AutoUpdateFolderCache;
  private listeners: Listener[] = [];

  constructor(opts: { cwd: string; cachePath: string }) {
    this.srcPath = opts.cwd;
    this.cachePath = opts.cachePath;

    this.folderCache = new AutoUpdateFolderCache({
      cwd: this.srcPath,
      exts: ['ts', 'js', 'jsx', 'tsx'],
      ignored: [
        '**/*.d.ts',
        '**/*.test.{js,ts,jsx,tsx}',
        // fixme respect to environment
        '**/.umi-production/**',
        '**/node_modules/**',
        '**/.git/**',
      ],
      debouncedTimeout: 500,
      filesLoader: async (files: string[]) => {
        const loaded: Record<string, string> = {};
        await this.batchProcess(files);

        for (const f of files) {
          let newFile = join(this.cachePath, relative(this.srcPath, f));

          // fixme ensure the last one
          newFile = newFile.replace(extname(newFile), '.js');

          loaded[f] = readFileSync(newFile, 'utf-8');
        }
        return loaded;
      },
      onCacheUpdate: (_cache, events) => {
        const merged = this.getMergedCode();

        this.listeners.forEach((l) => l(merged, events));
      },
    });
  }

  async init() {
    const [files] = await Promise.all([this.initFileList(), esModuleLexerInit]);

    await this.folderCache.loadFiles(files);
  }

  private async initFileList(): Promise<string[]> {
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
    return files;
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

  getMergedCode() {
    const fileContentCache = this.folderCache.getFileCache();
    const code = Object.values(fileContentCache).join('\n');
    const [imports] = parse(code);
    const merged = {
      code,
      imports,
    };
    return merged;
  }

  register(l: Listener) {
    if (this.listeners.indexOf(l) < 0) {
      this.listeners.push(l);
    }

    return () => {
      const i = this.listeners.indexOf(l);
      this.listeners.splice(i, 1);
    };
  }
}
