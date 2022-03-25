import { fork } from 'child_process';
import fs from 'fs';
import path from 'path';
import type { ILintArgs, ILinterOpts } from '../types';

interface ILinterConfigFiles {
  lintConfig: string;
  ignoreConfig?: string;
}

/**
 * base linter
 */
export default class BaseLinter {
  /**
   * linter package name
   */
  linter = '';

  /**
   * user config file names (without extension)
   */
  userFiles: ILinterConfigFiles = { lintConfig: '' };

  /**
   * paths for linter
   */
  paths: Partial<ILinterOpts & ILinterConfigFiles> = {};

  constructor({ cwd, linterResolveDir }: ILinterOpts) {
    this.paths.cwd = cwd;
    this.paths.linterResolveDir = linterResolveDir;

    // try to read user config
    (Object.keys(this.userFiles) as (keyof ILinterConfigFiles)[]).forEach(
      (file) => {
        const userFilePath = this.getUserConfig(file);

        if (userFilePath) {
          this.paths[file] = userFilePath;
        }
      },
    );
  }

  /**
   * get bin file path for current linter
   */
  getBinPath() {
    try {
      const pkgPath = path.dirname(require.resolve(`${this.linter}/package.json`, {
        paths: [this.paths.linterResolveDir!],
      }));
      const pkgContent = require(pkgPath);

      return path.resolve(pkgPath, pkgContent.bin[this.linter]);
    } catch (e) {
      throw new Error(`${this.linter} not found, please install it first.`);
    }
  }

  /**
   * try to get user config by filename
   * @param file  filename without extension
   */
  getUserConfig(file: string) {
    const rcFile = fs
      .readdirSync(this.paths.cwd!, { withFileTypes: true })
      .find((item) => item.isFile() && path.parse(item.name).name === file);

    return rcFile && path.join(this.paths.cwd!, rcFile.name);
  }

  /**
   * get linter fork args
   */
  getRunArgs(args: ILintArgs): string[] {
    // not implemented
    args;
    return [];
  }

  /**
   * execute linter
   */
  run(args: ILintArgs) {
    fork(this.getBinPath(), this.getRunArgs(args));
  }
}
