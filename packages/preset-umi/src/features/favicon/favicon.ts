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

function getFaviconFiles(p: string): string[] | undefined {
  const iconlist: string[] = [];
  FAVICON_FILES.forEach((f) => {
    if (existsSync(join(p, f))) {
      iconlist.push(f);
    }
  });
  return iconlist;
}

export default (api: IApi) => {
  api.describe({
    config: {
      schema: (Joi) => Joi.string(),
    },
  });

  api.modifyAppData(async (memo) => {
    if (api.config.favicon) return memo;
    const faviconFiles = getFaviconFiles(api.paths.absSrcPath);
    if (faviconFiles) {
      memo.faviconFiles = faviconFiles;
    }
    return memo;
  });

  api.addBeforeMiddlewares(() => [
    (req, res, next) => {
      if (api.appData.faviconFiles) {
        var send = false;
        for (const item of api.appData.faviconFiles) {
          if (req.path === `/${item}`) {
            send = true;
            res.sendFile(join(api.paths.absSrcPath, item));
          }
        }
        if (!send) {
          next();
        }
      } else {
        next();
      }
    },
  ]);

  api.onBuildComplete(({ err }) => {
    if (err) return;
    if (api.appData.faviconFiles) {
      api.appData.faviconFiles.forEach((e) => {
        copyFileSync(
          join(api.paths.absSrcPath, e),
          join(api.paths.absOutputPath, e),
        );
      });
    }
  });

  api.modifyHTMLFavicon((memo) => {
    if (!memo.length && api.appData.faviconFiles) {
      api.appData.faviconFiles.forEach((e) => {
        memo.push(`${api.config.publicPath}${e}`);
      });
    }
    return memo;
  });
};
