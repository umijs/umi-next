import { loadEnv } from '@umijs/core';
import { logger, yParser } from '@umijs/utils';
import { printHelp } from '../client/utils';
import { DEV_COMMAND } from '../constants';
import { getCwd } from '../service/cwd';
import { Service } from '../service/service';
import { dev } from './dev';
import {
  checkLocal,
  checkVersion as checkNodeVersion,
  setNoDeprecation,
  setNodeTitle,
} from './node';

interface IOpts {
  presets?: string[];
}

export async function run(opts?: IOpts) {
  loadEnv({ cwd: getCwd(), envFile: '.env' });
  checkNodeVersion();
  checkLocal();
  setNodeTitle();
  setNoDeprecation();

  const args = yParser(process.argv.slice(2), {
    alias: {
      version: ['v'],
      help: ['h'],
    },
    boolean: ['version'],
  });
  const command = args._[0];
  if ([DEV_COMMAND, 'setup'].includes(command)) {
    process.env.NODE_ENV = 'development';
  } else if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  if (opts?.presets) {
    process.env.UMI_PRESETS = opts.presets.join(',');
  }
  if (command === DEV_COMMAND) {
    dev();
  } else {
    try {
      await new Service().run2({
        name: args._[0],
        args,
      });
    } catch (e: any) {
      logger.fatal(e);
      printHelp();
      process.exit(1);
    }
  }
}
