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

  // get all mock paths
  const { mockPaths, mockData } = getMockData({
    cwd,
    paths,
    config,
    registerBabel,
  });

  api.addMiddlewareAhead(async () => {
    return createMiddleware({
      mockData,
      mockPaths,
      updateMockData: () => {
        const result = getMockData({ cwd, paths, config, registerBabel });
        return result;
      },
    });
  });
}
