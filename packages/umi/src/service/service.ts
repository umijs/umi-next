import { Service as CoreService } from '@umijs/core';
import { existsSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { DEFAULT_CONFIG_FILES, FRAMEWORK_NAME } from '../constants.js';
import { getCwd } from './cwd.js';

const require = createRequire(import.meta.url);

export class Service extends CoreService {
  constructor(opts?: any) {
    process.env.UMI_DIR = dirname(require.resolve('../../package'));
    const cwd = getCwd();
    super({
      ...opts,
      env: process.env.NODE_ENV,
      cwd,
      defaultConfigFiles: DEFAULT_CONFIG_FILES,
      frameworkName: FRAMEWORK_NAME,
      presets: [require.resolve('@umijs/preset-umi'), ...(opts?.presets || [])],
      plugins: [
        existsSync(join(cwd, 'plugin.ts')) && join(cwd, 'plugin.ts'),
        existsSync(join(cwd, 'plugin.js')) && join(cwd, 'plugin.js'),
      ].filter(Boolean),
    });
  }

  async run2(opts: { name: string; args?: any }) {
    let name = opts.name;
    if (opts?.args.version || name === 'v') {
      name = 'version';
    } else if (opts?.args.help || !name || name === 'h') {
      name = 'help';
    }

    // TODO
    // initWebpack

    return await this.run({ ...opts, name });
  }
}
