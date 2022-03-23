import yArgs from '@umijs/utils/compiled/yargs-parser';
import { cmd } from '@umijs/utils/src/cmd';

(async () => {
  const args = yArgs(process.argv.slice(2));
  const scope = args.scope || '!@example/*';
  const extra = (args._ || []).join(' ');

  await turbo({
    cmd: args.cmd,
    scope,
    extra,
    cache: args.cache,
    parallel: args.parallel,
  });
})();

async function turbo(opts: {
  scope: string;
  cmd: string;
  extra?: string;
  cache?: boolean;
  parallel?: boolean;
}) {
  const extraCmd = opts.extra ? `-- -- ${opts.extra}` : '';
  const cacheCmd = opts.cache === false ? '--no-cache --force' : '';
  const parallelCmd = opts.parallel ? '--parallel' : '';

  const options = [
    opts.cmd,
    `--cache-dir=".turbo"`,
    `--scope="${opts.scope}"`,
    `--no-deps`,
    `--include-dependencies`,
    cacheCmd,
    parallelCmd,
    extraCmd,
  ]
    .filter(Boolean)
    .join(' ');

  return cmd(`turbo run ${options}`);
}
