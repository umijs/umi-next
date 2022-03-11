import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import rimraf from '../../compiled/rimraf';
import generateFile from './generateFile';

const fixtures = join(__dirname, './fixtures');
const cwd = join(fixtures, 'generate');

const globKeepDotFile = join(cwd, '*');

beforeEach(() => {
  rimraf.sync(globKeepDotFile, { glob: { ignore: ['**/.gitkeep'] } });
});

afterAll(() => {
  rimraf.sync(globKeepDotFile, { glob: { ignore: ['**/.gitkeep'] } });
});

test('generate tpl', async () => {
  await generateFile({
    path: join(fixtures, 'tpl'),
    target: join(cwd, 'hello/', ''),
  });
  expect(existsSync(join(cwd, 'hello', 'index.tsx'))).toEqual(true);
});

test('generate tpl file', async () => {
  await generateFile({
    path: join(fixtures, 'tpl', 'index.tsx.tpl'),
    target: join(cwd, 'file-tpl', 'index.tsx'),
  });
  expect(existsSync(join(cwd, 'file-tpl', 'index.tsx'))).toEqual(true);
});

test('generate by file', async () => {
  await generateFile({
    path: join(fixtures, 'tpl', 'a.tsx'),
    target: join(cwd, 'file', 'a.tsx'),
  });
  expect(existsSync(join(cwd, 'file', 'a.tsx'))).toEqual(true);
});

test('generate tpl by data', async () => {
  await generateFile({
    path: join(fixtures, 'tpl'),
    target: join(cwd, 'data'),
    data: {
      componentName: 'Home',
    },
  });
  expect(existsSync(join(cwd, 'data', 'index.tsx'))).toEqual(true);
  expect(readFileSync(join(cwd, 'data', 'index.tsx'), 'utf-8')).toContain(
    'HomePage',
  );
});

test('generate filename edge cases', async () => {
  await generateFile({
    path: join(fixtures, 'filename-edge-cases'),
    target: join(cwd, 'edge-cases'),
    data: {
      name: 'eslint-config-umi',
    },
  });

  expect(existsSync(join(cwd, 'edge-cases', '.env'))).toEqual(true);
  expect(existsSync(join(cwd, 'edge-cases', 'scss/_variables.scss'))).toEqual(
    true,
  );
  expect(existsSync(join(cwd, 'edge-cases', '.eslintrc'))).toEqual(true);

  expect(readFileSync(join(cwd, 'edge-cases', '.eslintrc'), 'utf-8')).toContain(
    `"extends": "eslint-config-umi"`,
  );

  rimraf.sync(join(cwd, 'edge-cases'));
});
