import { IApi } from '@umijs/types';
import { parseRequireDeps } from '@umijs/utils';
import createMiddleware from './createMiddleware';
import { getMockData, IGetMockDataResult } from './utils';

export default function(api: IApi) {
  const { cwd, userConfig } = api;

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

  if (process.env.MOCK === 'none') {
    return;
  }

  const registerBabel = (paths: string[]): void => {
    // support
    // clear require cache and set babel register
    const requireDeps = paths.reduce((memo: string[], file) => {
      memo = memo.concat(parseRequireDeps(file));
      return memo;
    }, []);
    requireDeps.forEach(f => {
      if (require.cache[f]) {
        delete require.cache[f];
      }
    });
    api.babelRegister.setOnlyMap({
      key: 'mock',
      value: [...paths, ...requireDeps],
    });
  };

  const ignore = userConfig?.mock?.exclude;

  // get all mock paths
  const mockResult = getMockData({
    cwd,
    ignore,
    registerBabel,
  });

  // disable when not exist mock dir
  if (!mockResult) {
    return;
  }

  api.addBeforeMiddewares(() => {
    const { middleware } = createMiddleware({
      ...mockResult,
      updateMockData: () => {
        const result = getMockData({
          cwd,
          ignore,
          registerBabel,
        }) as IGetMockDataResult;
        return result;
      },
    });
    return middleware;
  });
}
