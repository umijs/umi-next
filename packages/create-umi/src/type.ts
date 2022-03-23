import type { yParser } from '@umijs/utils';

export enum EMonorepoType {
  initMonorepo,
  initLib,
  // migration single project to monorepo
  migration,
}

export enum ENpmClient {
  npm = 'npm',
  yarn = 'yarn',
  pnpm = 'pnpm',
  cnpm = 'cnpm',
  tnpm = 'tnpm',
}

export enum ENpmRegistry {
  npm = 'https://registry.npmjs.org/',
  taobao = 'https://registry.npmmirror.com',
}

interface IArgs extends yParser.Arguments {
  /**
   * skip install deps phase
   * @example --no-install
   */
  install?: boolean;
  /**
   * use default data quick execute
   */
  default?: boolean;
  /**
   * create project with monorepo
   */
  monorepo?: boolean;
}

export interface ICliOpts {
  cwd: string;
  args: IArgs;
}

export interface IPromptsOpts extends ICliOpts {
  dest: string;
  tplDir: string;
  name: string;
  baseTplData: Record<string, any>;
}
