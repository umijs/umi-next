import type { RequestHandler } from '@umijs/bundler-webpack';
import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

const FAVICON_FILES = [
  'favicon.ico',
  'favicon.gif',
  'favicon.png',
  'favicon.jpg',
  'favicon.jpeg',
  'favicon.svg',
  'favicon.avif',
  'favicon.webp',
];

function getFaviconFile(p: string): string | undefined {
  const componentFile = FAVICON_FILES.find((f) => existsSync(join(p, f)));
  return componentFile;
}

export default (api: IApi) => {
  if (api.userConfig.favicon) return;
  api.modifyAppData(async (memo) => {
    const faviconFile = getFaviconFile(api.paths.absSrcPath);
    if (faviconFile) {
      memo.faviconFile = faviconFile;
    }
    return memo;
  });

  api.addMiddlewares({
    fn: () => {
      const faviconFile = getFaviconFile(api.paths.absSrcPath);
      if (faviconFile) {
        const faviconMiddleware: RequestHandler = (req, res, next) => {
          if (req.path === `/${faviconFile}`) {
            res.sendFile(join(api.paths.absSrcPath, faviconFile));
          } else {
            next();
          }
        };
        return faviconMiddleware as any;
      }
    },
  });

  api.onBuildComplete(({ err }) => {
    if (!err) {
      const faviconFile = getFaviconFile(api.paths.absSrcPath);
      if (faviconFile) {
        copyFileSync(
          join(api.paths.absSrcPath, faviconFile),
          join(api.paths.absOutputPath, faviconFile),
        );
      }
    }
  });

  api.modifyHTMLFavicon(() => {
    if (api.appData.faviconFile) {
      return api.appData.faviconFile;
    }
  });
};
