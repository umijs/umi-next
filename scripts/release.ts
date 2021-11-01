import * as logger from '@umijs/utils/src/logger';
import getGitRepoInfo from 'git-repo-info';
import { join } from 'path';
import rimraf from 'rimraf';
import 'zx/globals';
import { assert, eachPkg, getPkgs } from './utils';

(async () => {
  const { branch } = getGitRepoInfo();
  logger.info(`branch: ${branch}`);
  const pkgs = getPkgs();
  logger.info(`pkgs: ${pkgs.join(', ')}`);

  // check git status
  logger.event('check git status');
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // check git remote update
  logger.event('check git remote update');
  await $`git fetch`;
  const gitStatus = (await $`git status --short --branch`).stdout.trim();
  assert(!gitStatus.includes('behind'), `git status is behind remote`);

  // check npm registry
  logger.event('check npm registry');
  const registry = (await $`npm config get registry`).stdout.trim();
  assert(
    registry === 'https://registry.npmjs.org/',
    'npm registry is not https://registry.npmjs.org/',
  );

  // check package changed
  logger.event('check package changed');
  const changed = (await $`lerna changed --loglevel error`).stdout.trim();
  assert(changed, `no package is changed`);

  // check npm ownership
  logger.event('check npm ownership');
  const whoami = (await $`npm whoami`).stdout.trim();
  await Promise.all(
    ['umi', 'bigfish', '@umijs/core'].map(async (pkg) => {
      const owners = (await $`npm owner ls ${pkg}`).stdout
        .trim()
        .split('\n')
        .map((line) => {
          return line.split(' ')[0];
        });
      assert(owners.includes(whoami), `${pkg} is not owned by ${whoami}`);
    }),
  );

  // clean
  logger.event('clean');
  eachPkg(pkgs, ({ pkgPath, pkg }) => {
    logger.info(`clean dist of ${pkg}`);
    rimraf.sync(join(pkgPath, 'dist'));
  });

  // build packages
  logger.event('build packages');
  await $`npm run build:release`;

  // generate changelog
  // TODO
  logger.event('generate changelog');

  // bump version
  logger.event('bump version');
  await $`lerna version --exact --no-commit-hooks --no-git-tag-version --no-push --loglevel error`;
  const version = require('../lerna.json').version;

  // update pnpm lockfile
  logger.event('update pnpm lockfile');
  await $`pnpm i`;

  // commit
  logger.event('commit');
  await $`git commit --all --message "release: ${version}"`;

  // git tag
  logger.event('git tag');
  await $`git tag v${version}`;

  // git push
  logger.event('git push');
  await $`git push origin ${branch} --tags`;

  // npm publish
  logger.event('pnpm publish');
  const innerPkgs = pkgs.filter((pkg) => !['umi', 'bigfish'].includes(pkg));
  const tag =
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
      ? 'next'
      : 'latest';
  await Promise.all(
    innerPkgs.map(async (pkg) => {
      await $`cd packages/${pkg} && npm publish --tag ${tag}`;
    }),
  );
  await $`cd packages/umi && npm publish --tag ${tag}`;
  await $`cd packages/bigfish && npm publish --tag ${tag}`;

  // sync tnpm
  logger.event('sync tnpm');
  $.verbose = false;
  await Promise.all(
    pkgs.map(async (pkg) => {
      await $`tnpm sync ${pkg}`;
    }),
  );
  $.verbose = true;
})();
