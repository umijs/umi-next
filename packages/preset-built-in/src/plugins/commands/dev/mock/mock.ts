import { IApi } from '@umijs/types';
import createMiddleware from './createMiddleware';
import { getMockData } from './utils';

export default function(api: IApi) {
  const { cwd, config } = api;

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

  const ignore = config?.mock?.exclude;

  // get all mock paths
  const mockResult = getMockData({
    cwd,
    ignore,
    registerBabel,
  });

  api.addBeforeMiddewares(() => {
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
