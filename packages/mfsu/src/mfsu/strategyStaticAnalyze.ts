import { logger } from '@umijs/utils';
import { join } from 'path';
import { getAliasedPathWithLoopDetect } from '../babelPlugins/awaitImport/getAliasedPath';
import mfImport from '../babelPlugins/awaitImport/MFImport';
import { StaticDepInfo } from '../staticDepInfo/staticDepInfo';
import { IBuildDepPluginOpts } from '../webpackPlugins/buildDepPlugin';
import type { IMFSUStrategy, MFSU } from './mfsu';

export class StaticAnalyzeStrategy implements IMFSUStrategy {
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
        console.log('webpack found', c.modifiedFiles, c.removedFiles);

        // webpack start
        if (!c.modifiedFiles || c.modifiedFiles.size === 0) {
          return;
        }

        const start = Date.now();
        let event = this.staticDepInfo.getProducedEvent();
        while (event.length === 0) {
          await sleep(200);
          console.log('.');
          event = this.staticDepInfo.getProducedEvent();
          if (Date.now() - start > 5000) {
            console.log('waiting too long');
            break;
          }
        }
      },
      beforeCompile: async () => {
        console.log('new mfsu dep is building');
        if (mfsu.depBuilder.isBuilding) {
          mfsu.buildDepsAgain = true;
        } else {
          this.staticDepInfo.consumeAllProducedEvents();
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
        // fixme if mf module finished earlier than src compile
      },
    };
  }

  init(): Promise<void> {
    return this.staticDepInfo.init();
  }

  loadCache() {
    this.staticDepInfo.loadCache();
  }

  refresh() {
    this.staticDepInfo.snapshot();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
