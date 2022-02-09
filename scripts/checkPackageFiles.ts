import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { eachPkg, getPkgs } from './utils.js';

const cwd = process.cwd();
eachPkg(getPkgs(), (opts) => {
  console.log('Checking package:', opts.pkg);
  const pkgPath = path.join(cwd, 'packages', opts.pkg, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  // Pure ESM
  pkg.type = 'module';
  delete pkg.main;
  pkg.exports = {
    '.': './dist/index.js',
  };
  if (['bundler-utils', 'utils'].includes(opts.pkg)) {
    pkg.exports['./compiled/*'] = './compiled/*';
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  pkg.files;
  // TODO
  // 检测 pkg.files 是否包含必要的和当前 pkg 下的文件和目录
});
