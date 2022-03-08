import { getPackages } from '@manypkg/get-packages';
import { pkgUp } from '@umijs/utils/compiled/pkg-up';
import { existsSync, statSync } from 'fs';
import { dirname, join } from 'path';
import type { IApi } from '../../types';

interface IConfigs {
  source?: string[];
  exclude?: RegExp[];
}

export default (api: IApi) => {
  api.describe({
    key: 'monorepoRedirect',
    config: {
      schema(Joi) {
        return Joi.alternatives(
          Joi.boolean(),
          Joi.object({
            source: Joi.array().items(Joi.string()),
            exclude: Joi.array().items(Joi.object().instance(RegExp)),
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
    if (!isMonorepo({ root })) return memo;
    if (!memo.monorepoRedirect) return memo;

    const config: IConfigs = memo.monorepoRedirect || {};
    const { exclude = [], source = ['src'] } = config;
    // Note: not match `umi` package
    exclude.push(/^umi$/);
    // collect use workspace deps
    const workspacesDeps = collectWorkspaceDeps(api.pkg).filter((name) => {
      return !exclude.some((reg) => reg.test(name));
    });
    if (!workspacesDeps.length) return memo;
    // collect all project
    const projects = await collectAllProjects({ root });
    const alias = workspacesDeps.reduce<Record<string, string>>((obj, name) => {
      const root = projects[name];
      if (!root) {
        return obj;
      }
      source.some((dirName) => {
        const dirPath = join(root, dirName);
        if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
          // redirect to source dir
          obj[name] = dirPath;
          return true;
        }
      });
      return obj;
    }, {});
    memo.alias = {
      ...memo.alias,
      ...alias,
    };

    return memo;
  });
};

interface IOpts {
  root: string;
}

const DEP_KEYS = ['devDependencies', 'dependencies'];
function collectWorkspaceDeps(pkg: Record<string, any>) {
  const deps: string[] = [];
  DEP_KEYS.forEach((type) => {
    deps.push(...Object.keys(pkg?.[type] || {}));
  });
  return deps;
}

async function collectAllProjects(opts: IOpts) {
  const workspaces = await getPackages(opts.root);
  return workspaces.packages.reduce<Record<string, string>>((obj, pkg) => {
    const name = pkg.packageJson?.name;
    if (name) {
      obj[name] = pkg.dir;
    }
    return obj;
  }, {});
}

const MONOREPO_FILE = ['pnpm-workspace.yaml', 'lerna.json'];
function isMonorepo(opts: IOpts) {
  const pkgExist = existsSync(join(opts.root, 'package.json'));
  return (
    pkgExist &&
    MONOREPO_FILE.some((file) => {
      return existsSync(join(opts.root, file));
    })
  );
}
