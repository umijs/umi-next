import { join } from 'path';

const pkgPath = join(__dirname, '../../package.json');

export const getCorejsVersion = () => {
  const pkg = require(pkgPath);
  const version =
    pkg.dependencies['core-js']?.split('.').slice(0, 2).join('.') || '3';
  return version;
};
