import { Service } from '@umijs/core';
import { join } from 'path';
import { rimraf, got } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';

const fixtures = join(__dirname, 'fixtures');

test('normal', async () => {
  const cwd = join(fixtures, 'normal');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  await service.run({
    name: 'build',
  });

  const absTmpDir = join(cwd, '.umi-test');
  expect(existsSync(join(absTmpDir, 'umi.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/history.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/plugin.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/routes.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/umiExports.ts'))).toEqual(true);
  rimraf.sync(join(absTmpDir));
  expect(existsSync(join(cwd, 'dist', 'umi.js'))).toEqual(true);
  rimraf.sync(join(cwd, 'dist'));
});

test('api.writeTmpFile error in register stage', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin-error'))],
  });
  await expect(service.init()).rejects.toThrow(
    /api.writeTmpFile\(\) should not execute in register stage./,
  );
});

test('api.writeTmpFile', async () => {
  const cwd = join(fixtures, 'api-writeTmpFile');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
    plugins: [require.resolve(join(cwd, 'plugin'))],
  });
  await service.run({
    name: 'foo',
    args: {},
  });
  const tmpFile = join(cwd, '.umi-test', 'foo');
  expect(readFileSync(tmpFile, 'utf-8')).toEqual('foo');
  rimraf.sync(tmpFile);
});

test('dev', async () => {
  const cwd = join(fixtures, 'normal');
  const service = new Service({
    cwd,
    presets: [require.resolve('./index.ts')],
  });
  const { port, hostname, listeningApp } = await service.run({
    name: 'dev',
  });

  const result = await got(`http://${hostname}:${port}`);
  expect(result.body).toMatch(/umi\.css/);
  expect(result.body).toMatch(/umi\.js/);
  expect(result.statusCode).toEqual(200);

  const absTmpDir = join(cwd, '.umi-test');
  expect(existsSync(join(absTmpDir, 'umi.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/history.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/plugin.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/routes.ts'))).toEqual(true);
  expect(existsSync(join(absTmpDir, 'core/umiExports.ts'))).toEqual(true);
  rimraf.sync(join(absTmpDir));
  listeningApp.close();
});
