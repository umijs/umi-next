export type NpmClient = 'npm' | 'cnpm' | 'tnpm' | 'yarn' | 'pnpm';

export const getNpmClient = (): NpmClient => {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes('cnpm')) return 'cnpm';
    if (userAgent.includes('tnpm')) return 'tnpm';
    if (userAgent.includes('yarn')) return 'yarn';
    if (userAgent.includes('pnpm')) return 'pnpm';
  }
  return 'npm';
};

export const checkNpmClient = (npmClient: NpmClient): boolean => {
  const userAgent = process.env.npm_config_user_agent;
  return !!(userAgent && userAgent.includes(npmClient));
};

export const installWithNpmClient = ({
  npmClient,
  cwd,
}: {
  npmClient: NpmClient;
  cwd?: string;
}): void => {
  const { spawnSync } = require('child_process');
  const npm = spawnSync(npmClient, [npmClient === 'yarn' ? '' : 'install'], {
    stdio: 'inherit',
    cwd,
  });
  if (npm.error) {
    throw npm.error;
  }
};
