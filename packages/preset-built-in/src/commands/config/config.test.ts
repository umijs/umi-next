import { Env, Service } from '@umijs/core';
import { readFileSync } from 'fs';
import { join } from 'path';

const fixtures = join(__dirname, '../../../fixtures');
const cwd = join(fixtures, 'config');
async function runGenerator(args: any) {
  const service = new Service({
    cwd,
    env: Env.test,
    plugins: [require.resolve(join(cwd, 'p1')), require.resolve('./index')],
  });
  await service.run({
    name: 'config',
    args,
  });
}

test('set config:abc', async () => {
  await runGenerator({
    _: ['config', 'set', 'abc', false],
  });
  const config = readFileSync(join(cwd, 'config.ts'), 'utf-8');
  expect(config).toContain('abc: false');
});

test('remove config:abc', async () => {
  await runGenerator({
    _: ['config', 'remove', 'abc'],
  });
  const config = readFileSync(join(cwd, 'config.ts'), 'utf-8');
  expect(config).not.toContain('abc');
});
