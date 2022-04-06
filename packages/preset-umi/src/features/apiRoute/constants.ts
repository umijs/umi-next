import { join } from 'path';
import type { IApi } from '../../types';

export enum ServerlessPlatform {
  Vercel = 'vercel',
  Netlify = 'netlify',
  Worker = 'worker',
  UmiDevServer = 'umi-dev-server',
}

export function getPlatform(p: string) {
  switch (p) {
    case 'vercel':
      return ServerlessPlatform.Vercel;
    case 'netlify':
      return ServerlessPlatform.Netlify;
    case 'worker':
      return ServerlessPlatform.Worker;
    default:
      return undefined;
  }
}

// Get the final output path of the api route files
export function getApiRouteBuildPath(api: IApi, platform: ServerlessPlatform) {
  switch (platform) {
    case ServerlessPlatform.Vercel:
      return join(api.paths.cwd, 'api');
    case ServerlessPlatform.UmiDevServer:
      return join(api.paths.absTmpPath, 'api/_compiled');
    default:
      return join(api.paths.cwd, 'api');
  }
}
