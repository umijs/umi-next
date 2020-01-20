import { RequestHandler } from 'express';
import matchMock from './matchMock';
import normalizeConfig from './normalizeConfig';

interface IOpts {
  mockData: any;
}

export default function(opts = {} as IOpts): RequestHandler {
  const { mockData } = opts;
  const data = normalizeConfig(mockData);

  return (req, res, next) => {
    const match = mockData && matchMock(req, data);
    if (match) {
      // debug(`mock matched: [${match.method}] ${match.path}`);
      return match.handler(req, res, next);
    } else {
      return next();
    }
  };
}
