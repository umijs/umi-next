import { existsSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '../../../');
const lernaPath = join(root, './lerna.json');
const rootPkgPath = join(root, './package.json');
const currentPkg = require(join(__dirname, '../package.json'));

/**
 * check weather in local dev umi
 */
export const isUmiLocal = () => {
  return (
    existsSync(lernaPath) &&
    existsSync(rootPkgPath) &&
    require(lernaPath).version === currentPkg.version
  );
};
