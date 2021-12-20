import { Mustache, winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'request',
    config: {
      schema: (joi) => {
        return joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePluginKey(() => ['request']);

  const requestTpl = readFileSync(
    join(__dirname, '../libs/request/request.tpl'),
    'utf-8',
  );

  api.onGenerateFiles(() => {
    const ahooksPkg = winPath(dirname(require.resolve('ahooks')));
    const axiosPath = winPath(dirname(require.resolve('axios')));
    const antdPkg = winPath(dirname(require.resolve('antd')));
    api.writeTmpFile({
      path: 'request.ts',
      content: Mustache.render(requestTpl, {
        ahooksPkg,
        axiosPath,
        antdPkg,
      }),
    });
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export * from './request';
`,
    });
  });
};
