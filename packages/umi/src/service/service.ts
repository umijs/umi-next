import { Service as CoreService } from '@umijs/core';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { DEFAULT_CONFIG_FILES, FRAMEWORK_NAME } from '../constants';
import { getCwd } from './cwd';

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

    if (canRunWithLooseConfig(name)) {
      this.configResolver.loose();
    }

    // TODO
    // initWebpack

    return await this.run({ ...opts, name });
  }
}

// prettier-ignore
const LOOSE_COMMAND_LIST = [
  'v', 'version',
  'g', 'generate',
  'config',
  'help',
  'verify-commit'
];

function canRunWithLooseConfig(name: string) {
  return LOOSE_COMMAND_LIST.includes(name);
}
