import { dirname, join } from 'path';
import { existsSync, writeFileSync } from 'fs';
import { mkdirp, rimraf } from '@umijs/utils';
import { cleanTmpPathExceptCache } from './buildDevUtils';

const fixtures = join(__dirname, '.buildDevUtilsCache');

test('buildDevUtils', async () => {
  const target = join(fixtures, 'a.js');
  const cacheTarget = join(fixtures, '.cache', 'a.js');
  mkdirp.sync(dirname(target));
  writeFileSync(
    target,
    "console.log('buildDevUtils cleanTmpPathExceptCache');",
    'utf-8',
  );
  mkdirp.sync(dirname(cacheTarget));
  writeFileSync(
    cacheTarget,
    "console.log('buildDevUtils cleanTmpPathExceptCache');",
    'utf-8',
  );
  cleanTmpPathExceptCache({ absTmpPath: fixtures });
  expect(existsSync(join(fixtures, '.cache', 'a.js'))).toEqual(true);
  expect(existsSync(join(fixtures, 'a.js'))).toEqual(false);
  rimraf.sync(fixtures);
});
