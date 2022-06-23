import type { RequestHandler } from '@umijs/bundler-webpack';
import { join } from 'pathe';

export const faviconMiddleware: RequestHandler = (req, res, next) => {
  if (req.path === '/favicon.ico') {
    res.sendFile(join(__dirname, '../../../assets/umi.png'));
  } else {
    next();
  }
};
