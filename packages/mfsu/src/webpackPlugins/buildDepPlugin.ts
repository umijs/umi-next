import type { Compiler } from 'webpack';

interface IOpts {
  onCompileDone: Function;
}

const PLUGIN_NAME = 'MFSUBuildDeps';

export class BuildDepPlugin {
  private opts: IOpts;

  constructor(opts: IOpts) {
    this.opts = opts;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.beforeCompile.tap(PLUGIN_NAME, () => {
      this.opts.onCompileDone();
    });
  }
}
