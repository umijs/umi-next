import { isMonorepo, logger, resolve } from '@umijs/utils';
import { pkgUp } from '@umijs/utils/compiled/pkg-up';
import assert from 'assert';
import { existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
// @ts-ignore
import { getPackages } from '../../../compiled/@manypkg/get-packages';
import type { IApi } from '../../types';

interface IConfigs {
  srcDir?: string[];
  exclude?: RegExp[];
  peerDeps?: boolean;
}

/**
 * default redirect react core deps in `peerDeps` scene
 */
const CORE_DEPS = ['react', 'react-dom', 'react-router', 'react-router-dom'];
export default (api: IApi) => {
  api.describe({
    key: 'monorepoRedirect',
    config: {
      schema(Joi) {
        return Joi.alternatives(
          Joi.boolean(),
          Joi.object({
            srcDir: Joi.array().items(Joi.string()),
            exclude: Joi.array().items(Joi.object().instance(RegExp)),
            peerDeps: Joi.boolean(),
          }),
        );
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyConfig(async (memo) => {
    const rootPkg = await pkgUp({ cwd: dirname(api.cwd) });
    if (!rootPkg) return memo;
    const root = dirname(rootPkg);
    assert(
      isMonorepo({ root }),
      `The 'monorepoRedirect' option can only be used in monorepo, you don't need configure.`,
    );

    const config: IConfigs = memo.monorepoRedirect || {};
    const { exclude = [], srcDir = ['src'], peerDeps = false } = config;
    // Note: not match `umi` package in local dev
    if (__filename.includes(`packages/preset-umi`)) {
      logger.info(
        `[monorepoRedirect]: Auto excluded 'umi' package in local dev scene`,
      );
      exclude.push(/^umi$/);
    }
    // collect current project using other workspace deps
    const usingDeps = collectPkgDeps(api.pkg).filter((name) => {
      return !exclude.some((reg) => reg.test(name));
    });
    if (!usingDeps.length) return memo;
    // collect all project
    const { projects } = await collectAllProjects({ root });
    const needRedirectPeerDeps = CORE_DEPS;
    const alias = usingDeps.reduce<Record<string, string>>((obj, name) => {
      const submodule = projects[name];
      if (!submodule) {
        return obj;
      }
      // redirect to source dir
      srcDir.some((dirName) => {
        const dirPath = join(submodule.dir, dirName);
        if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
          obj[name] = dirPath;
          return true;
        }
      });
      // collect peer deps
      if (peerDeps) {
        const deps = Object.keys(
          submodule.packageJson['peerDependencies'] || {},
        );
        needRedirectPeerDeps.push(...deps);
      }
      return obj;
    }, {});
    // redirect peer deps
    if (peerDeps) {
      needRedirectPeerDeps.forEach((depName) => {
        const depDir = resolveDep({ cwd: api.cwd, name: depName });
        if (depDir) {
          alias[depName] = depDir;
        }
      });
    }
    memo.alias = {
      ...memo.alias,
      ...alias,
    };

    return memo;
  });
};

interface IProject {
  packageJson: Record<string, any>;
  dir: string;
}

const DEP_KEYS = ['devDependencies', 'dependencies'];
function collectPkgDeps(pkg: Record<string, any>) {
  const deps: string[] = [];
  DEP_KEYS.forEach((type) => {
    deps.push(...Object.keys(pkg?.[type] || {}));
  });
  return deps;
}

async function collectAllProjects(opts: { root: string }) {
  const workspaces = await getPackages(opts.root);
  const projects: Record<string, IProject> = workspaces.packages.reduce(
    (obj: Record<string, IProject>, pkg: IProject) => {
      const name = pkg.packageJson?.name;
      if (name) {
        obj[name] = pkg;
      }
      return obj;
    },
    {},
  );
  return {
    projects,
  };
}

function resolveDep(opts: { cwd: string; name: string }) {
  try {
    const pkgPath = resolve.sync(`${opts.name}/package.json`, {
      basedir: opts.cwd,
    });
    return dirname(pkgPath);
  } catch {
    return false;
  }
}
