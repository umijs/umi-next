import { isArray, isFunction } from '@umijs/utils/compiled/lodash';
import type { Application, Request, RequestHandler, Response } from 'express';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

export function serveUmiApp(root: string) {
  const resolvedRoot = resolve(root);

  const index = join(resolvedRoot, 'index.html');

  return function (req: Request, res: Response) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405);
      res.setHeader('Allow', 'GET, HEAD');
      res.setHeader('Content-Length', '0');
      res.end();
      return;
    }
    const file = join(resolvedRoot, req.path);

    if (existsSync(file)) {
      res.sendFile(file);
    } else {
      res.sendFile(index);
    }
  };
}

// just a subset of all supported methods of express
type HttpMethod = 'get' | 'post' | 'head' | 'put';

type MiddlewareDesc = {
  handler: RequestHandler | RequestHandler[];
  method?: HttpMethod[] | HttpMethod;
  path?: string;
};

function isMiddlewareDesc(md: any): md is MiddlewareDesc {
  return isFunction(md.handler) || isArray(md.handler);
}

export type MiddleWare = RequestHandler | MiddlewareDesc;

export function mountMiddleware(app: Application, mw: MiddleWare) {
  if (typeof mw === 'function') {
    return app.use(mw);
  }
  if (isMiddlewareDesc(mw)) {
    const path = mw.path || '/';
    const handler = isArray(mw.handler) ? mw.handler : [mw.handler];

    if (mw.method) {
      if (isArray(mw.method)) {
        if (mw.method.length) {
          mw.method.forEach((m) => {
            app[m](path, ...handler);
          });
        } else {
          app.use(path, ...handler);
        }
      } else {
        app[mw.method](path, ...handler);
      }
    } else {
      app.use(path, ...handler);
    }
  }
  return app;
}
