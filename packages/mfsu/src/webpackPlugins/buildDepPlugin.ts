import type { Compiler } from 'webpack';

interface IOpts {
  onCompileDone: Function;
  onFileChange?: (c: Compiler) => Promise<any>;
  beforeCompile?: () => Promise<any>;
}

const PLUGIN_NAME = 'MFSUBuildDeps';

export class BuildDepPlugin {
  private opts: IOpts;

  constructor(opts: IOpts) {
    this.opts = opts;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, (c) => {
      return this.opts.onFileChange?.(c) || Promise.resolve();
    });

    compiler.hooks.beforeCompile.tap(PLUGIN_NAME, () => {
      this.opts.beforeCompile?.();
    });

    compiler.hooks.compile.tap(PLUGIN_NAME, () => {
      this.opts.onCompileDone();
    });
  }
}
