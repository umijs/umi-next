import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';
import { IApi, IScript } from '../../types';

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

export async function getMarkupArgs(opts: { api: IApi }) {
  const headScripts = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLHeadScripts',
    initialValue: opts.api.config.headScripts || [],
  });
  const scripts: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLScripts',
    initialValue: opts.api.config.scripts || [],
  });
  const metas: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLMetas',
    initialValue: opts.api.config.metas || [],
  });
  const links: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLLinks',
    initialValue: opts.api.config.links || [],
  });
  const styles: any = await opts.api.applyPlugins<IScript[]>({
    key: 'addHTMLStyles',
    initialValue: opts.api.config.styles || [],
  });
  let favicon = opts.api.config.favicon;
  // 没有配置，走约定
  if (!favicon) {
    const faviconFile = getFaviconFile(opts.api.paths.absSrcPath);
    if (faviconFile) {
      copyFileSync(
        join(opts.api.paths.absSrcPath, faviconFile),
        join(opts.api.paths.absOutputPath, faviconFile),
      );
      favicon = faviconFile;
    }
  }
  return {
    routes: opts.api.appData.routes,
    favicon,
    headScripts,
    scripts,
    metas,
    links,
    styles,
    // modifyHTML: () => {},
  };
}
