import { Env, Service } from '@umijs/core';
import { rimraf } from '@umijs/utils';
import { existsSync } from 'fs';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');
const cwd = join(fixtures, 'normal');
async function runGenerator(args: any) {
  const service = new Service({
    cwd,
    env: Env.test,
    presets: [require.resolve('../../index')],
  });
  await service.run({
    name: 'generate',
    args,
  });
}

test('generate tmp', async () => {
  await runGenerator({
    _: ['generate', 'tmp'],
  });
  expect(existsSync(join(cwd, 'umi-test', 'umi.ts'))).toEqual(true);
  expect(existsSync(join(cwd, '.umi-test', 'core', 'route.ts'))).toEqual(true);
  rimraf.sync(join(cwd, '.umi-test'));
});
