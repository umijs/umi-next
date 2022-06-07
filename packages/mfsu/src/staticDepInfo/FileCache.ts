import { lodash } from '@umijs/utils';
import { FSWatcher, watch } from 'chokidar';
import { join } from 'path';

type AbsPath = string;
type FileContent = string;
type FileContentCache = Record<AbsPath, FileContent>;
type ResultCache<T> = Record<AbsPath, T>;
type FileChangeEvent = { event: 'unlink' | 'change'; path: string };

export class FileCache<T> {
  fileContentCache: FileContentCache = {};
  resultCache: ResultCache<T> = {};
  private watcher: FSWatcher;
  private readonly readyPromise: Promise<void>;
  private readonly cwd: string;
  private readonly batchProcess: (
    absPaths: string[],
  ) => Promise<Record<AbsPath, { content: string; result: T }>>;

  pendingChanges: FileChangeEvent[] = [];
  private readonly debouchedHandleChanges: () => void;
  private readonly onCacheUpdated: (update: {
    fileContentCache: FileContentCache;
    resultCache: ResultCache<T>;
  }) => void;

  constructor(opts: {
    cwd: string;
    exts: string[];
    processFile: (absPath: string) => Promise<{ content: string; result: T }>;
    batchProcess: (
      absPaths: string[],
    ) => Promise<Record<AbsPath, { content: string; result: T }>>;
    onCacheUpdate: () => void;
    debouncedTimeout: number;
  }) {
    this.watcher = watch(`./**/*.{${opts.exts.join(',')}`, {
      ignored: [
        '**/*.d.ts',
        '**/*.test.{js,ts,jsx,tsx}',
        // fixme respect to environment
        '**/.umi-production/**',
        '**/node_modules/**',
      ],
      cwd: opts.cwd,
      ignoreInitial: true,
    });

    this.cwd = opts.cwd;
    this.batchProcess = opts.batchProcess;
    this.onCacheUpdated = opts.onCacheUpdate;

    this.readyPromise = new Promise<void>((resolve) => {
      this.watcher.on('ready', () => {
        resolve();
      });
    });

    this.debouchedHandleChanges = lodash.debounce(async () => {
      const modifiedFiles = [];
      const handledEvents = [];

      while (this.pendingChanges.length > 0) {
        const c = this.pendingChanges.pop()!;
        handledEvents.push(c);

        if (c.event === 'unlink') {
          delete this.fileContentCache[c.path];
        }
        if (c.event === 'change') {
          modifiedFiles.push(c.path);
        }
      }

      await this.handleFilesUpdate(modifiedFiles);
    }, opts.debouncedTimeout);

    this.watcher.on('all', (eventName, path) => {
      switch (eventName) {
        case 'change':
        case 'add':
          this.pendingChanges.push({
            event: 'change',
            path: join(this.cwd, path),
          });
          this.debouchedHandleChanges();
          break;
        case 'unlink':
          this.pendingChanges.push({
            event: 'unlink',
            path: join(this.cwd, path),
          });
          this.debouchedHandleChanges();
          break;
        default:
        // ignore all others;
      }
    });
  }

  async init() {
    await this.readyPromise;
    const watched = this.watcher.getWatched();
    const files = [];
    for (const dir in watched) {
      for (const f of watched[dir]) {
        const absPath = join(this.cwd, dir, f);
        files.push(absPath);
      }
    }

    await this.handleFilesUpdate(files);
  }

  private async handleFilesUpdate(files: string[]) {
    const results = await this.batchProcess(files);

    for (const k in results) {
      const r = results[k];
      this.fileContentCache[k] = r.content;
      this.resultCache[k] = r.result;
    }

    this.onCacheUpdated({
      fileContentCache: this.fileContentCache,
      resultCache: this.resultCache,
    });
  }
}
