import { IApi } from '@umijs/types';
import createMiddleware from './createMiddleware';
import { getMockData } from './utils';

export default function(api: IApi) {
  const { paths, cwd, config } = api;

  api.describe({
    key: 'mock',
    config: {
      schema(joi) {
        return joi.object().keys({
          exclude: joi.array().items(joi.string()),
        });
      },
    },
  });

  const registerBabel = (paths: string[]): void => {
    // babel compiler
    api.babelRegister.setOnlyMap({
      key: 'mock',
      value: paths,
    });
  };

  const ignore = config?.mock?.ignore;

  // get all mock paths
  const mockResult = getMockData({
    cwd,
    paths,
    ignore,
    registerBabel,
  });

  api.addMiddlewareAhead(async () => {
    const { middleware } = createMiddleware({
      ...mockResult,
      updateMockData: () => {
        const result = getMockData({ cwd, paths, ignore, registerBabel });
        return result;
      },
    });
    return middleware;
  });
}
