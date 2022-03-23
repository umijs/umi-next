import { existsSync } from 'fs';
import { join } from 'path';

const MONOREPO_FILE = ['pnpm-workspace.yaml', 'lerna.json'];
export function isMonorepo(opts: { root?: string }) {
  const root = opts.root || process.cwd();
  const pkgExist = existsSync(join(root, 'package.json'));
  return (
    pkgExist &&
    MONOREPO_FILE.some((file) => {
      return existsSync(join(root, file));
    })
  );
}
