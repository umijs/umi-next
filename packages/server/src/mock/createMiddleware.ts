import { RequestHandler } from 'express';
import matchMock from './matchMock';
import normalizeConfig from './normalizeConfig';

export interface IMockOpts {
  data: any;
}

export default function(opts = {} as IMockOpts): RequestHandler {
  const { data } = opts;
  const mockData = normalizeConfig(data);
  console.log('mockDatamockData', mockData);

  return (req, res, next) => {
    const match = mockData && matchMock(req, mockData);
    if (match) {
      // debug(`mock matched: [${match.method}] ${match.path}`);
      return match.handler(req, res, next);
    } else {
      return next();
    }
  };
}
