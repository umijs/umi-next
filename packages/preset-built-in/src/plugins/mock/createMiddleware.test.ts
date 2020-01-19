import { join } from 'path';
import { writeFileSync } from 'fs';
import express from 'express';
import { Service } from '@umijs/core';
import { winPath } from '@umijs/utils';
import portfinder from 'portfinder';
import got from 'got';
import rimraf from 'rimraf';
import createMiddleware from './createMiddleware';
import { getMockData } from './utils';

let port;
let server;
const cwd = winPath(join(__dirname, 'fixtures/createMiddleware'));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const HOME_PAGE = 'homepage';
let watcher = null;

describe('createMiddleware', () => {
  beforeAll(async () => {
    portfinder.basePort = 3000;
    portfinder.highestPort = 8000;
    port = await portfinder.getPortPromise();
    const service = new Service({
      cwd,
      plugins: [],
    });
    await service.init();
    const mockOpts = getMockData({
      cwd,
      paths: service.paths,
      ignore: service.userConfig.mock?.exclude,
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
    return new Promise((resolve, reject) => {
      const app = express();
      app.use(middleware);
      app.use((req, res, next) => {
        if (req.path === '/') {
          res.end(HOME_PAGE);
        } else {
          next();
        }
      });
      server = app.listen(port, err => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  });

  afterAll(() => {
    if (watcher) watcher.close();
  });

  it('get', async () => {
    const { body } = await got(`http://localhost:${port}/api/a`);
    expect(body).toEqual(`{"a":1}`);
  });

  it('post', async () => {
    const { body } = await got(`http://localhost:${port}/api/a`, {
      method: 'post',
    });
    expect(body).toEqual(`{"a":1}`);
  });

  it('function handler', async () => {
    const { body } = await got(`http://localhost:${port}/api/b`);
    expect(body).toEqual(`{"b":1}`);
  });

  it('fallback to next', async () => {
    const { body } = await got(`http://localhost:${port}/`);
    expect(body).toEqual(HOME_PAGE);
  });

  it('params', async () => {
    const { body } = await got(`http://localhost:${port}/api/users/1`);
    expect(body).toEqual(`{"a":1}`);
  });

  it('watch', async () => {
    const absTmpFile = join(cwd, 'mock/tmp.js');
    writeFileSync(absTmpFile, `export default {'/api/tmp': {tmp:1}}`, 'utf-8');
    await delay(500);
    const { body } = await got(`http://localhost:${port}/api/tmp`);
    expect(body).toEqual(`{"tmp":1}`);
    rimraf.sync(absTmpFile);
  });

  it.skip('watch with error', async () => {
    const absTmpFile = join(cwd, 'mock/tmp2.js');
    writeFileSync(absTmpFile, `export defaul;`, 'utf-8');
    await delay(500);
    rimraf.sync(absTmpFile);
  });

  afterAll(() => {
    if (server) server.close();
  });
});
