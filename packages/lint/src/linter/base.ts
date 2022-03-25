import { fork } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ILinterConfigFiles {
  lintConfig: string;
  ignoreConfig?: string;
}

/**
 * base linter
 */
export default class BaseLinter {
  /**
   * user config file names (without extension)
   */
  userFiles: ILinterConfigFiles = { lintConfig: '' };

  /**
   * paths include the default config file
   */
  paths: { cwd?: string; bin: string } & ILinterConfigFiles = {
    bin: '',
    lintConfig: '',
  };

  constructor(cwd: string) {
    this.paths.cwd = cwd;

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
  getRunArgs(args: Record<string, string>): string[] {
    // not implemented
    args;
    return [];
  }

  /**
   * execute linter
   */
  run(args: Parameters<typeof BaseLinter.prototype.getRunArgs>[0]) {
    fork(this.paths.bin, this.getRunArgs(args));
  }
}
