import { resolve } from 'pathe';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.addApiMiddlewares(() => [
    {
      name: 'loggerMiddleware',
      path: resolve(__dirname, './loggerMiddleware.ts'),
    },
  ]);
};
