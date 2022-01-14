import { init, parse } from '@umijs/bundler-utils/compiled/es-module-lexer';
import { Loader, transformSync } from '@umijs/bundler-utils/compiled/esbuild';
import { winPath } from '@umijs/utils';
import { dirname, extname } from 'path';

export async function parseModule(opts: { content: string; path: string }) {
  let content = opts.content;

  if (opts.path.endsWith('.tsx') || opts.path.endsWith('.jsx')) {
    content = transformSync(content, {
      loader: extname(opts.path).slice(1) as Loader,
      format: 'esm',
    }).code;
  }

  await init;
  return parse(content);
}

export function isDepPath(path: string) {
  const umiMonorepoPath = winPath(dirname(dirname(__dirname))).match(
    /([^/]+\/packages)$/,
  )?.[1];

  return (
    path.includes('node_modules') ||
    (umiMonorepoPath && path.includes(umiMonorepoPath))
  );
}
