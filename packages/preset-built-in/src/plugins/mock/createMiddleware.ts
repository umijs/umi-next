import { RequestHandler } from 'express';
import { chokidar, signale, createDebug } from '@umijs/utils';
import matchMock from './matchMock';
import normalizeConfig from './normalizeConfig';
import { cleanRequireCache, IGetMockDataResult } from './utils';

const debug = createDebug('umi:preset-build-in:mock:createMiddleware');

export interface IMockOpts extends IGetMockDataResult {
  updateMockData: () => IGetMockDataResult;
}

export default function(opts = {} as IMockOpts): RequestHandler {
  const { mockData, mockPaths, updateMockData } = opts;
  let data = normalizeConfig(mockData);

  // watcher
  const errors: any[] = [];
  const watcher = chokidar.watch(mockPaths, {
    ignoreInitial: true,
  });
  watcher.on('change', file => {
    debug(`${file}, reload mock data`);
    console.log(`${file}, reload mock data`);
    errors.splice(0, errors.length);
    cleanRequireCache(mockPaths);
    // refresh data
    data = normalizeConfig(updateMockData()?.mockData);
    if (!errors.length) {
      signale.success(`Mock files parse success`);
    }
  });

  return (req, res, next) => {
    const match = data && matchMock(req, data);
    if (match) {
      // debug(`mock matched: [${match.method}] ${match.path}`);
      return match.handler(req, res, next);
    } else {
      return next();
    }
  };
}
