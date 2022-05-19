import { chalk, fsExtra, installWithNpmClient } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

interface ICheckDep {
  name: string;
  condition: boolean;
}

const DEPS_MAP: Record<string, string> =
  require('@umijs/bundler-webpack/package.json').devDependencies;

export default (api: IApi) => {
  // TODO: 支持在上层框架锁定，比如通过 api.appData.depsOnDemand 添加可选依赖
  const hasDep = (name: string) => {
    return api.pkg.dependencies?.[name] || api.pkg.devDependencies?.[name];
  };
  const checkDeps = (deps: ICheckDep[]) => {
    const willInstallDeps: string[] = [];
    deps.forEach((dep) => {
      const { name, condition } = dep;
      if (condition && !hasDep(name)) {
        const nameWithColor = chalk.cyan(name);
        api.logger.info(`
 > Since ${nameWithColor} is used, install ${nameWithColor} on demand.`);
        willInstallDeps.push(name);
      }
    });
    if (!willInstallDeps.length) return;
    addDeps({
      pkgPath: api.pkgPath || join(api.cwd, 'package.json'),
      deps: willInstallDeps,
    });
    installWithNpmClient({
      npmClient: api.appData.npmClient,
      cwd: api.cwd,
    });
  };

  api.onStart(() => {
    // swc
    const hasSwcConfig =
      api.config.srcTranspiler === 'swc' || api.config.depTranspiler === 'swc';
    // uglify-js
    const hasUglifyJsConfig = api.config.jsMinifier === 'uglifyJs';
    // parcel-css
    const hasParcelCSSConfig = api.config.cssMinifier === 'parcelCSS';

    checkDeps([
      {
        name: '@swc/core',
        condition: hasSwcConfig,
      },
      {
        name: 'uglify-js',
        condition: hasUglifyJsConfig,
      },
      {
        name: '@parcel/css',
        condition: hasParcelCSSConfig,
      },
    ]);
  });
};

function addDeps(opts: { pkgPath: string; deps: string[] }) {
  const { pkgPath, deps } = opts;
  const pkg = existsSync(pkgPath) ? fsExtra.readJSONSync(pkgPath) : {};
  pkg.devDependencies ||= {};
  deps.forEach((name) => {
    pkg.devDependencies[name] = `^${DEPS_MAP[name]}`;
  });
  fsExtra.writeJSONSync(pkgPath, pkg, { spaces: 2 });
}
