import { winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { IApi } from 'umi';

// TODO: method 的命名问题
export default (api: IApi) => {
  api.describe({
    key: 'request',
    config: {
      default: {
        dataFiled: 'data',
        method: 'axios',
      },
      schema: (joi) => {
        return joi.object({
          dataFiled: joi
            .string()
            .pattern(/^[a-zA-Z]*$/)
            .allow(''),
          method: joi.string().valid('axios', 'umi-request'),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.addRuntimePluginKey(() => ['request']);

  const requestTpl = readFileSync(
    join(__dirname, '../templates/request/request.ts'),
    'utf-8',
  );

  api.onGenerateFiles(() => {
    const ahooksPkg = winPath(dirname(require.resolve('ahooks')));
    const axiosPath = winPath(dirname(require.resolve('axios')));
    console.log(ahooksPkg, axiosPath);

    api.writeTmpFile({
      path: 'request.ts',
      content: requestTpl
        .replace('@umijs/utils/compiled/axios', axiosPath)
        .replace('ahooks', ahooksPkg)
        .replace('antd', winPath(dirname(require.resolve('antd')))),
    });
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export * from './request';
`,
    });
  });
};
