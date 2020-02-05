import { IApi, IRoute, Html } from '@umijs/types';
import { Bundler as DefaultBundler, ConfigType } from '@umijs/bundler-webpack';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { rimraf } from '@umijs/utils';

type Env = 'development' | 'production';

export async function getBundleAndConfigs({
  api,
  port,
}: {
  api: IApi;
  port?: number;
}) {
  // bundler
  const Bundler = await api.applyPlugins({
    type: api.ApplyPluginsType.modify,
    key: 'modifyBundler',
    initialValue: DefaultBundler,
  });

  const bundleImplementor = await api.applyPlugins({
    key: 'modifyBundleImplementor',
    type: api.ApplyPluginsType.modify,
    initialValue: undefined,
  });

  // get config
  async function getConfig({ type }: { type: ConfigType }) {
    const env: Env = api.env === 'production' ? 'production' : 'development';
    const getConfigOpts = await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBundleConfigOpts',
      initialValue: {
        env,
        type,
        port,
        hot: type === ConfigType.csr,
        entry: {
          umi: join(api.paths.absTmpPath!, 'umi.ts'),
        },
        // @ts-ignore
        bundleImplementor,
        async modifyBabelOpts(opts: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'modifyBabelOpts',
            initialValue: opts,
          });
        },
        async modifyBabelPresetOpts(opts: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'modifyBabelPresetOpts',
            initialValue: opts,
          });
        },
        async chainWebpack(webpackConfig: any, opts: any) {
          return await api.applyPlugins({
            type: api.ApplyPluginsType.modify,
            key: 'chainWebpack',
            initialValue: webpackConfig,
            args: {
              ...opts,
            },
          });
        },
      },
      args: {
        ...bundlerArgs,
        type,
      },
    });
    return await api.applyPlugins({
      type: api.ApplyPluginsType.modify,
      key: 'modifyBundleConfig',
      initialValue: await bundler.getConfig(getConfigOpts),
      args: {
        ...bundlerArgs,
        type,
      },
    });
  }

  const bundler: DefaultBundler = new Bundler({
    cwd: api.cwd,
    config: api.config,
  });
  const bundlerArgs = {
    env: api.env,
    bundler: { id: Bundler.id, version: Bundler.version },
  };
  const bundleConfigs = await api.applyPlugins({
    type: api.ApplyPluginsType.modify,
    key: 'modifyBundleConfigs',
    initialValue: [
      await getConfig({ type: ConfigType.csr }),
      api.config!.ssr && (await getConfig({ type: ConfigType.ssr })),
    ].filter(Boolean),
    args: {
      ...bundlerArgs,
      getConfig,
    },
  });

  return {
    bundleImplementor,
    bundler,
    bundleConfigs,
  };
}

export function cleanTmpPathExceptCache({
  absTmpPath,
}: {
  absTmpPath: string;
}) {
  if (!existsSync(absTmpPath)) return;
  readdirSync(absTmpPath).forEach(file => {
    if (file === `.cache`) return;
    rimraf.sync(join(absTmpPath, file));
  });
}

export function getHtmlGenerator({
  api,
}: {
  api: IApi;
}): InstanceType<typeof Html> {
  const getDocumentTplPath = () => {
    const { absPagesPath } = api.paths || {};
    const absPageDocumentPath = join(absPagesPath || '', 'document.ejs');

    // TODO: route.document ejs
    // if (route.document) {
    //   const docPath = join(cwd || '', route.document);
    //   assert(existsSync(docPath), `document ${route.document} don't exists.`);
    //   return docPath;
    // }

    if (existsSync(absPageDocumentPath)) {
      return absPageDocumentPath;
    }
    return '';
  };

  const addHTMLFactory = (key: string): any => {
    return (memo: any[], args: { route: IRoute }) =>
      api.applyPlugins({
        key,
        type: api.ApplyPluginsType.add,
        initialValue: memo,
        args,
      });
  };

  const tplPath = getDocumentTplPath();

  return new api.Html({
    config: api.config,
    tplPath,
    addHTMLHeadScripts: addHTMLFactory('addHTMLHeadScripts'),
    addHTMLLinks: addHTMLFactory('addHTMLLinks'),
    addHTMLMetas: addHTMLFactory('addHTMLMetas'),
    addHTMLScripts: addHTMLFactory('addHTMLScripts'),
    addHTMLStyles: addHTMLFactory('addHTMLStyles'),
  });
}
