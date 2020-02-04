import ejs from 'ejs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import cheerio from 'cheerio';
import { IConfig, IRoute, Service } from '..';
import { prettier } from '@umijs/utils';

interface IOpts {
  config: IConfig;
  service: Service;
}

interface IMeta {
  [key: string]: string;
}

type IModifyHtml<T = string> = (memo: T[], opts: { route: IRoute }) => T[];

interface IGetContentArgs {
  route: IRoute;
  metas?: IMeta[];
  headJSFiles?: string[];
  jsFiles?: string[];
  cssFiles?: string[];
  tplPath?: string;
  modifyHeadScripts?: IModifyHtml;
  modifyScripts?: IModifyHtml;
  modifyLinks?: IModifyHtml;
  modifyMetas?: IModifyHtml<IMeta>;
  modifyStyles?: IModifyHtml;
}

class Html {
  config: IConfig;
  service: Service;
  constructor(opts: IOpts) {
    this.config = opts.config;
    this.service = opts.service;
  }

  // 获取顺序：
  // 传入的 tplPath => route.document > pages/document.ejs > built-in document.ejs
  getDocumentTplPath({ route, tplPath }: { route: IRoute; tplPath: string }) {
    const { cwd, absPagesPath } = this.service?.paths || {};
    const absPageDocumentPath = join(absPagesPath || '', 'document.ejs');

    if (tplPath) {
      assert(
        existsSync(tplPath),
        `getContent() failed, tplPath of ${tplPath} not exists.`,
      );
      return tplPath;
    }

    if (route.document) {
      const docPath = join(cwd || '', route.document);
      assert(existsSync(docPath), `document ${route.document} don't exists.`);
      return docPath;
    }

    if (existsSync(absPageDocumentPath)) {
      return absPageDocumentPath;
    }

    return join(__dirname, 'document.ejs');
  }

  getAsset({ file }: { file: string }) {
    if (/^https?:\/\//.test(file)) {
      return file;
    }
    const publicPath = this.config.publicPath || '/';
    return `${publicPath}${file.charAt(0) === '/' ? file.slice(1) : file}`;
  }

  getContent(args: IGetContentArgs): string {
    let {
      route,
      metas = [],
      headJSFiles = [],
      jsFiles = [],
      cssFiles = [],
      tplPath = '',
      // TODO
      modifyHeadScripts,
      modifyLinks,
      modifyScripts,
      modifyMetas,
      modifyStyles,
    } = args;
    const { config } = this;

    const tpl = readFileSync(
      this.getDocumentTplPath({ tplPath, route }),
      'utf-8',
    );
    const context = {
      config,
    };
    let html = ejs.render(tpl, context, {
      _with: false,
      localsName: 'context',
      filename: 'document.ejs',
    });

    const $ = cheerio.load(html);

    if (modifyMetas) metas = modifyMetas(metas, { route });
    if (modifyLinks) cssFiles = modifyLinks(cssFiles, { route });
    // TODO: 支持 ['umi.js', `console.log('')`, '//g.alicdn.com/umi.js']
    // TODO: 以及 [{ src: 'umi.js' }, { content: `console.log()` }, { src: '//' }]
    if (modifyScripts) jsFiles = modifyScripts(jsFiles, { route });
    if (modifyHeadScripts) {
      headJSFiles = modifyHeadScripts(headJSFiles, { route });
    }

    // metas
    metas.forEach(meta => {
      $('head').append(
        [
          '<meta',
          ...Object.keys(meta).reduce((memo, key) => {
            return memo.concat(`${key}="${meta[key]}"`);
          }, [] as string[]),
          '/>',
        ].join(' '),
      );
    });

    // title
    if (config.title && !$('head > title').length) {
      $('head').append('<title>foo</title>');
    }

    // css
    cssFiles.forEach(file => {
      $('head').append(
        `<link rel="stylesheet" href="${this.getAsset({ file })}" />`,
      );
    });

    // root element
    const mountElementId = config.mountElementId || 'root';
    if (!$(`#${mountElementId}`).length) {
      const bodyEl = $('body');
      assert(bodyEl.length, `<body> not found in html template.`);
      bodyEl.append(`<div id="${mountElementId}"></div>`);
    }

    // js
    headJSFiles.forEach(file => {
      $('head').append(`<script src="${this.getAsset({ file })}"></script>`);
    });
    jsFiles.forEach(file => {
      $('body').append(`<script src="${this.getAsset({ file })}"></script>`);
    });

    html = $.html();
    html = prettier.format(html, {
      parser: 'html',
    });

    return html;
  }
}

export default Html;
