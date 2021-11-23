import express from '@umijs/bundler-webpack/compiled/express';
import { portfinder, rimraf, winPath } from '@umijs/utils';
import { writeFileSync } from 'fs';
import got from 'got';
import { join } from 'path';
import createMiddleware from './createMiddleware';
import { getMockData } from './utils';

describe('createMiddleware', () => {
  const cwd = winPath(join(__dirname, 'fixtures/createMiddleware'));

  const delay = async (time: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, time || 20);
    });
  };
  const HOME_PAGE = 'homepage';
  let watcher: any = null;
  let port: number;
  let server: any;
  let hostname: string = 'localhost';

  beforeAll(async () => {
    const mockOpts = getMockData({
      cwd,
      ignore: [],
    });
    const { middleware, watcher: middlewareWatcher } = createMiddleware({
      ...mockOpts,
      updateMockData: async () =>
        getMockData({
          cwd,
          ignore: [],
        }),
    });
    watcher = middlewareWatcher;
    const app = express();
    app.use((req, res, next) => {
      if (req.path === '/') {
        res.end(HOME_PAGE);
      } else {
        next();
      }
    });
    app.use(middleware);
    const _port = await portfinder.getPortPromise({
      port: 8000,
    });
    server = await app.listen({
      port: _port,
      hostname,
    });
    port = _port;
  });

  afterAll(async () => {
    await watcher?.close?.();
    server?.close();
  });

  it('fallback to next', async () => {
    const { body } = await got(`http://${hostname}:${port}`);
    expect(body).toEqual(HOME_PAGE);
  });

  it('get', async () => {
    const { body } = await got(`http://${hostname}:${port}/api/a`);
    expect(body).toEqual(`{"a":1}`);
  });

  it('post', async () => {
    const { body } = await got(`http://${hostname}:${port}/api/a`, {
      method: 'post',
    });
    expect(body).toEqual(`{"a":1}`);
  });

  it('function handler', async () => {
    const { body } = await got(`http://${hostname}:${port}/api/b`);
    expect(body).toEqual(`{"b":1}`);
  });

  it('params', async () => {
    const { body } = await got(`http://${hostname}:${port}/api/users/1`);
    expect(body).toEqual(`{"a":1}`);
  });

  xit('watch', async () => {
    const absTmpFile = winPath(join(cwd, 'mock/tmp.js'));
    writeFileSync(absTmpFile, `export default {'/api/tmp': {tmp:1}}`, 'utf-8');
    await delay(500);
    const { body } = await got(`http://${hostname}:${port}/api/tmp`);
    expect(body).toEqual(`{"tmp":1}`);
    rimraf.sync(absTmpFile);
  });

  it.skip('watch with error', async () => {
    const absTmpFile = winPath(join(cwd, 'mock/tmp2.js'));
    writeFileSync(absTmpFile, `export defaul;`, 'utf-8');
    await delay(500);
    rimraf.sync(absTmpFile);
  });
});
