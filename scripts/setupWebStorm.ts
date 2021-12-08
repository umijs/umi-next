import { winPath } from '@umijs/utils';
import { join } from 'path';
import { eachPkg, getPkgs, setExcludeFolder } from './utils';

const cwd = winPath(process.cwd());
eachPkg(getPkgs(), ({ pkg }) => {
  setExcludeFolder({ pkg, cwd });
});

eachPkg(
  getPkgs({ base: join(__dirname, '../examples') }),
  ({ pkg }) => {
    setExcludeFolder({
      pkg,
      cwd,
      dirName: 'examples',
      folders: ['.mfsu', '.umi'],
    });
  },
  {
    base: winPath(join(__dirname, '../examples')),
  },
);
