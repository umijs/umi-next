import {
  installWithNpmClient,
  lodash,
  logger,
  prompts,
  semver,
} from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { set as setUmirc } from '../config/set';

function hasDeps({ name, pkg }: { name: string; pkg: any }) {
  return pkg.dependencies?.[name] || pkg.devDependencies?.[name];
}

export function checkStatus({ pkg }: { pkg: any }) {
  let needInstall = true;
  // 有以下依赖时不需要安装 @umijs/plugins
  if (
    hasDeps({ pkg, name: '@umijs/plugins' }) ||
    hasDeps({ pkg, name: '@umijs/max' }) ||
    hasDeps({ pkg, name: '@alipay/bigfish' })
  ) {
    needInstall = false;
  }

  let needConfigPlugins = true;
  // 有以下依赖时不需要配置依赖
  if (
    hasDeps({ pkg, name: '@umijs/max' }) ||
    hasDeps({ pkg, name: '@alipay/bigfish' })
  ) {
    needConfigPlugins = false;
  }

  return {
    needInstall,
    needConfigPlugins,
  };
}

export class GeneratorHelper {
  private readonly needConfigUmiPlugin: boolean;
  private readonly needInstallUmiPlugin: boolean;

  constructor(readonly api: IApi) {
    const { needInstall, needConfigPlugins } = checkStatus({
      pkg: api.pkg,
    });
    this.needInstallUmiPlugin = needInstall;
    this.needConfigUmiPlugin = needConfigPlugins;
  }

  setUmirc(key: string, val: any) {
    setUmirc(this.api, key, val);
  }

  appendInternalPlugin(pluginPath: string) {
    if (
      this.needConfigUmiPlugin &&
      !(this.api.userConfig.plugins || []).includes(pluginPath)
    ) {
      this.setUmirc(
        'plugins',
        (this.api.userConfig.plugins || []).concat(pluginPath),
      );
    }
  }

  addDevDeps(deps: Record<string, string>) {
    const { api } = this;

    const externalDeps = lodash.omit(deps, ['@umijs/plugins']);

    // 已存在给出覆盖提示
    Object.keys(externalDeps).forEach((key: string) => {
      if (hasDeps({ name: key, pkg: api.pkg })) {
        logger.info(
          `${key} Version: ${api.pkg.devDependencies![key]} is replaced by ${
            externalDeps[key]
          }`,
        );
      }
    });

    if (this.needInstallUmiPlugin) {
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        ...deps,
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info(`addDevDeps: ${Object.keys(deps).join(',')}`);
    } else if (!lodash.isEmpty(externalDeps)) {
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        ...externalDeps,
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info(`addDevDeps: ${Object.keys(deps).join(',')}`);
    }
  }

  addScript(name: string, cmd: string) {
    const { api } = this;

    if (api.pkg.scripts?.[name] && api.pkg.scripts?.[name] !== cmd) {
      logger.warn(
        `scripts.${name} = "${api.pkg.scripts?.[name]}" already exists, will be overwritten with "${cmd}"!`,
      );
    }

    api.pkg.scripts = {
      ...api.pkg.scripts,
      [name]: cmd,
    };
    writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
    logger.info('Write package.json');
  }

  installDeps() {
    const { npmClient } = this.api.appData;
    installWithNpmClient({
      npmClient,
    });
    logger.info(`Install dependencies with ${npmClient}`);
  }

  async ensureVariableWithQuestion<V>(
    v: V,
    question: Omit<prompts.PromptObject<'variable'>, 'name'>,
  ) {
    if (!v) {
      const res = await promptsExitWhenCancel({
        ...question,
        name: 'variable',
      });

      return res.variable ? res.variable : question.initial;
    }

    return v;
  }
}

export function getUmiJsPlugin() {
  const pkg = require(join(__dirname, '../../../', 'package.json'));
  const pkgVer = semver.parse(pkg.version);

  const umijsPluginVersion = pkgVer?.prerelease?.length
    ? pkg.version
    : `^${pkg.version}`;
  return umijsPluginVersion;
}

// the definition is copied from prompts.d.ts; if there is a better way to do this, tell me.
export function promptsExitWhenCancel<T extends string = string>(
  questions: prompts.PromptObject<T> | Array<prompts.PromptObject<T>>,
  options?: Pick<prompts.Options, 'onSubmit'>,
): Promise<prompts.Answers<T>> {
  return prompts(questions, {
    ...options,
    onCancel: () => {
      process.exit(1);
    },
  });
}

export function trim(s?: string) {
  return s?.trim() || '';
}
