import 'zx/globals';
import { eachPkg, getPkgs } from './utils';

// check packages/*
eachPkg(getPkgs(), ({ name, pkgJson }) => {
  console.log(`Checking ${chalk.cyan('package')}:`, name);
  pkgJson.files;
  // TODO
  // 检测 pkg.files 是否包含必要的和当前 pkg 下的文件和目录
});

// check examples/*
const EXAMPLE_DIR = path.join(__dirname, '../examples');
eachPkg(
  getPkgs({ base: EXAMPLE_DIR }),
  ({ name, pkgJson, pkgPath }) => {
    console.log(`Checking ${chalk.blue('example')}:`, name);
    const expectName = `@example/${name}`;
    if (pkgJson.name !== expectName) {
      pkgJson.name = expectName;
      console.log(
        chalk.yellow(`Change '${name}' example name to '${expectName}'`),
      );
    }
    if (pkgJson.private !== true) {
      pkgJson.private = true;
      console.log(chalk.yellow(`Set '${name}' example as private pacakge`));
    }
    fs.writeFileSync(pkgPath, `${JSON.stringify(pkgJson, null, 2)}\n`, 'utf-8');
  },
  {
    base: EXAMPLE_DIR,
  },
);
