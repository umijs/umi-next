import { logger } from '@umijs/utils';
import http from 'http';
import type {
  DepOptimizationMetadata,
  HmrContext,
  InlineConfig as ViteInlineConfig,
} from 'vite';
import { createServer as createViteServer } from 'vite';
import express from '../../compiled/express';
import type { IConfig } from '../types';
import pluginOnHotUpdate from './plugins/onHotUpdate';

interface IOpts {
  cwd: string;
  viteConfig: ViteInlineConfig;
  userConfig: IConfig;
  beforeMiddlewares?: any[];
  afterMiddlewares?: any[];
  /**
   * onDevCompileDone hook
   * @param args  includes 2 fields:
   *              - isFirstCompile:
   *                  it would be true after the dev server is started
   *                  it should be false before each HMR is sent
   *              - stats:
   *                  it would be DepOptimizationMetadata after the dev server is started
   *                  it would be the modules of HMR Context before each HMR is sent
   */
  onDevCompileDone?: (args: {
    time: number;
    isFirstCompile: boolean;
    stats: HmrContext['modules'] | DepOptimizationMetadata;
  }) => Promise<void> | void;
}

export async function createServer(opts: IOpts) {
  const startTms = +new Date();
  const { viteConfig, onDevCompileDone } = opts;
  const app = express();
  const vite = await createViteServer({
    ...viteConfig,
    // use `handleHotUpdate` vite hook to workaround `onDevCompileDone` umi hook
    ...(typeof onDevCompileDone === 'function'
      ? {
          plugins: viteConfig.plugins!.concat([
            pluginOnHotUpdate(async (modules) => {
              await onDevCompileDone({
                time: 0,
                isFirstCompile: false,
                stats: modules,
              });
            }),
          ]),
        }
      : {}),
    server: { middlewareMode: 'html' },
  });

  // use vite via middleware way
  app.use(vite.middlewares);

  // before middlewares
  (opts.beforeMiddlewares || []).forEach((m) => app.use(m));

  // writeToDisk(?)
  // mock
  // prerender
  // bundless

  // after middlewares
  console.log('test', opts.afterMiddlewares);
  (opts.afterMiddlewares || []).forEach((m) => app.use(m));

  const server = http.createServer(app);

  const port = process.env.PORT || 8000;

  server.listen(port, async () => {
    if (typeof onDevCompileDone === 'function') {
      await onDevCompileDone({
        time: +new Date() - startTms,
        isFirstCompile: true,
        // @ts-ignore
        stats: vite._optimizeDepsMetadata,
      });
    }

    logger.ready(
      `Example app listening at http://${
        process.env.HOST || '127.0.0.1'
      }:${port}`,
    );
  });

  return server;
}
