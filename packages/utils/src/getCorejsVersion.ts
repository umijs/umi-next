import fsExtra from '../compiled/fs-extra/index.js';

export const getCorejsVersion = (pkgPath: string) => {
  const pkg = fsExtra.readJsonSync(pkgPath, { encoding: 'utf-8' });
  const version =
    pkg.dependencies['core-js']?.split('.').slice(0, 2).join('.') || '3';
  return version;
};
