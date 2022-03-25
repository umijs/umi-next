import { chalk, cmd, logger } from '@umijs/utils';
import assert from 'assert';
import type { IApi } from '../../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'turbo',
    description: 'use turbo execute command for monorepo',
    details: `
umi turbo build --scope='web'
`,
    fn: async function ({ args }) {
      const { _, ...opts } = args;
      const [cmd, ...passCmds] = _;
      assert(
        cmd,
        `Command not found, you should specified command ( e.g. ${chalk.green(
          'umi turbo build --scope=web',
        )} )`,
      );
      if (!opts?.scope) {
        logger.warn(
          `You not specify ${chalk.yellow(
            '--scope',
          )} option, will effect all pkgs.`,
        );
      }
      turbo({
        cmd,
        extra: [
          ...Object.entries(opts).map(([key, value]) => {
            if (value === false) {
              return `--no-${key}`;
            }
            return `--${key}=${value}`;
          }),
          ...(passCmds || []),
        ].join(' '),
      });
    },
  });
};

async function turbo(opts: { cmd: string; extra?: string }) {
  const options = [opts.cmd, `--no-deps`, `--include-dependencies`, opts.extra]
    .filter(Boolean)
    .join(' ');

  return cmd(`turbo run ${options}`);
}
