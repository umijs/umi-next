import spawn from '@umijs/utils/compiled/cross-spawn';
import chalk from '../compiled/chalk';
import * as logger from './logger';

/**
 * Why not use zx ?
 *  - `zx` not support color stdin on subprocess
 *  - see https://github.com/google/zx/blob/main/docs/known-issues.md#colors-in-subprocess
 *        https://github.com/google/zx/issues/212
 */
export async function cmd(command: string) {
  logger.event(`${chalk.cyan(command)}`);
  const result = spawn.sync(command, {
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    // sub package command don't stop when execute fail.
    // display exit
    logger.error(`Execute command error (${command})`);
    process.exit(1);
  }
  return result;
}
