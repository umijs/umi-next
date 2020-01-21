import { join } from 'path';
import { writeFileSync } from 'fs';
import { Service } from '@umijs/core';
import { Server } from '@umijs/server';
import { winPath } from '@umijs/utils';
import got from 'got';
import rimraf from 'rimraf';
import createMiddleware from './createMiddleware';
import { getMockData } from './utils';

describe('createMiddleware', () => {
  const cwd = winPath(join(__dirname, 'fixtures/createMiddleware'));
  const delay = ms =>
    new Promise((resolve, reject) =>
      setTimeout(() => {
        try {
          resolve();
        } catch (e) {
          console.error('delay error', e);
          reject(e);
        }
      }, ms),
    );

  const HOME_PAGE = 'homepage';
  let watcher = null;
  let port;
  let server;
  let hostname;

  beforeAll(async () => {
    const service = new Service({
      cwd,
      plugins: [],
    });
    await service.init();
    const registerBabel = (paths: string[]): void => {
      // babel compiler
      service.babelRegister.setOnlyMap({
        key: 'test-mock',
        value: paths,
      });
    };
    const mockOpts = getMockData({
      cwd,
      paths: service.paths,
      ignore: service.userConfig.mock?.exclude,
      registerBabel,
    });
    const { middleware, watcher: middlewareWatcher } = createMiddleware({
      ...mockOpts,
      updateMockData: () =>
        getMockData({
          cwd,
          paths: service.paths,
          ignore: service.userConfig.mock?.exclude,
        }),
    });
    watcher = middlewareWatcher;
    server = new Server({
      beforeMiddlewares: [middleware],
      compilerMiddleware: (req, res, next) => {
        if (req.path === '/') {
          res.end(HOME_PAGE);
        } else {
          next();
        }
      },
    });
    const result = await server.listen({
      port: 8000,
      hostname: 'localhost',
    });
    port = result.port;
    hostname = result.hostname;
  });

  afterAll(() => {
    watcher?.close?.();
    server.listeningApp?.close();
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

  it('fallback to next', async () => {
    const { body } = await got(`http://${hostname}:${port}/`);
    expect(body).toEqual(HOME_PAGE);
  });

  it('params', async () => {
    const { body } = await got(`http://${hostname}:${port}/api/users/1`);
    expect(body).toEqual(`{"a":1}`);
  });

  it('watch', async () => {
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
