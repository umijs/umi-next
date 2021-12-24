import { winPath } from '@umijs/utils';
import { dirname, join } from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'hd',
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
  });

  api.chainWebpack((memo) => {
    memo.resolve.alias.set(
      'antd-mobile',
      winPath(
        join(
          dirname(require.resolve('antd-mobile/package.json')),
          api.userConfig.hd ? '2x' : '',
        ),
      ),
    );
    return memo;
  });
};
