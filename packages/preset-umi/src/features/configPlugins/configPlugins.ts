import { getSchemas as getViteSchemas } from '@umijs/bundler-vite/dist/schema';
import { DEFAULT_BROWSER_TARGETS } from '@umijs/bundler-webpack/dist/constants';
import { getSchemas as getWebpackSchemas } from '@umijs/bundler-webpack/dist/schema';
import { resolve } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi } from '../../types';
import { getSchemas as getExtraSchemas } from './schema';

function resolveProjectDep(opts: { pkg: any; cwd: string; dep: string }) {
  if (
    opts.pkg.dependencies?.[opts.dep] ||
    opts.pkg.devDependencies?.[opts.dep]
  ) {
    return dirname(
      resolve.sync(`${opts.dep}/package.json`, {
        basedir: opts.cwd,
      }),
    );
  }
}

export default (api: IApi) => {
  const reactDOMPath =
    resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: 'react-dom',
    }) || dirname(require.resolve('react-dom/package.json'));
  const reactDOMVersion = require(join(reactDOMPath, 'package.json')).version;
  const isLT18 = !reactDOMVersion.startsWith('18.');
  const configDefaults: Record<string, any> = {
    alias: {
      umi: '@@/exports',
      react:
        resolveProjectDep({
          pkg: api.pkg,
          cwd: api.cwd,
          dep: 'react',
        }) || dirname(require.resolve('react/package.json')),
      ...(isLT18
        ? {
            'react-dom/client': reactDOMPath,
          }
        : {}),
      'react-dom': reactDOMPath,
      'react-router': dirname(require.resolve('react-router/package.json')),
      'react-router-dom': dirname(
        require.resolve('react-router-dom/package.json'),
      ),
    },
    externals: {},
    autoCSSModules: true,
    publicPath: '/',
    mountElementId: 'root',
    base: '/',
    history: { type: 'browser' },
    targets: DEFAULT_BROWSER_TARGETS,
  };

  const bundleSchemas = api.config.vite
    ? getViteSchemas()
    : getWebpackSchemas();
  const extraSchemas = getExtraSchemas();
  const schemas = {
    ...bundleSchemas,
    ...extraSchemas,
  };
  for (const key of Object.keys(schemas)) {
    const config: Record<string, any> = {
      schema: schemas[key] || ((Joi: any) => Joi.any()),
    };
    if (key in configDefaults) {
      config.default = configDefaults[key];
    }

    // change type is regenerateTmpFiles
    if (['routes'].includes(key)) {
      config.onChange = api.ConfigChangeType.regenerateTmpFiles;
    }

    api.registerPlugins([
      {
        id: `virtual: config-${key}`,
        key: key,
        config,
      },
    ]);
  }

  // api.paths is ready after register
  api.modifyConfig((memo, args) => {
    memo.alias = {
      ...memo.alias,
      '@': args.paths.absSrcPath,
      '@@': args.paths.absTmpPath,
    };
    return memo;
  });
};
