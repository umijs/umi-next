import { Service } from '@umijs/core';
import { join } from 'path';
import { rimraf, winPath } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';

const fixtures = winPath(join(__dirname, '../../../fixtures'));

test('build', async () => {
  const cwd = winPath(join(fixtures, 'build'));
  const service = new Service({
    cwd,
    presets: [require.resolve('../../../index.ts')],
    // production 下 ci 时会报错
    env: 'production',
  });
  await service.run({
    name: 'build',
  });

  expect(existsSync(join(cwd, 'dist', 'umi.js'))).toEqual(true);
  const htmlPath = join(cwd, 'dist', 'index.html');
  expect(existsSync(htmlPath)).toEqual(true);
  const htmlContent = readFileSync(htmlPath, 'utf-8');
  expect(htmlContent).toContain('console.log(123);');
  expect(htmlContent).toContain('//a.alicdn.com/foo.js');
  expect(htmlContent).toContain('console.log(456);');
  expect(htmlContent).toContain('//a.alicdn.com/foo.css');
  rimraf.sync(join(cwd, 'dist'));
});
