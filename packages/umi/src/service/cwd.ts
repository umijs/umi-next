import { winPath } from '@umijs/utils';
import { isAbsolute, join } from 'path';

export function getCwd() {
  const cwd = winPath(process.cwd());
  const appRoot = process.env.APP_ROOT;
  if (appRoot) {
    return isAbsolute(appRoot) ? appRoot : join(cwd, appRoot);
  }
  return cwd;
}
