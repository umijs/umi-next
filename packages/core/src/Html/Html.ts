import ejs from 'ejs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import cheerio from 'cheerio';
import { IConfig, IRoute } from '..';

import { prettier } from '@umijs/utils';

interface IOpts {
  config: IConfig;
}

interface IScript extends Partial<HTMLScriptElement> {
  content?: string;
}

type IScriptType = Array<IScript | string>;

interface IMeta {
  [key: string]: string;
}

class Html {
  config: IConfig;
  constructor(opts: IOpts) {
    this.config = opts.config;
  }

  getAsset({ file }: { file: string }) {
    if (/^https?:\/\//.test(file)) {
      return file;
    }
    const publicPath = this.config.publicPath || '/';
    return `${publicPath}${file.charAt(0) === '/' ? file.slice(1) : file}`;
  }

  getScriptsContent(scripts: IScriptType) {
    return scripts
      .map(script => {
        // convert 'umi.js' => { src: 'umi.js' }
        const { content, ...attrs } =
          typeof script === 'string' ? { src: script, content: '' } : script;
        if (content && !attrs.src) {
          const newAttrs = Object.keys(attrs).reduce((memo, key) => {
            // @ts-ignore
            return memo.concat(`${key}="${attrs[key]}"`);
          }, []);
          return [
            `<script${newAttrs.length ? ' ' : ''}${newAttrs.join(' ')}>`,
            content
              .split('\n')
              .map(line => `  ${line}`)
              .join('\n'),
            '</script>',
          ].join('\n');
        } else {
          const newAttrs = Object.keys(attrs).reduce((memo, key) => {
            // @ts-ignore
            return memo.concat(`${key}="${attrs[key]}"`);
          }, []);
          return `<script ${newAttrs.join(' ')}></script>`;
        }
      })
      .join('\n');
  }

  getContent({
    route,
    metas = [],
    headJSFiles = [],
    jsFiles = [],
    cssFiles = [],
    tplPath,
  }: {
    route: IRoute;
    metas?: IMeta[];
    headJSFiles?: IScriptType;
    jsFiles?: IScriptType;
    cssFiles?: string[];
    tplPath?: string;
  }) {
    const { config } = this;
    if (tplPath) {
      assert(
        existsSync(tplPath),
        `getContent() failed, tplPath of ${tplPath} not exists.`,
      );
    }
    const tpl = readFileSync(
      tplPath || join(__dirname, 'document.ejs'),
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
    console.log('metas', metas);

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
    if (headJSFiles.length) {
      $('head').append(this.getScriptsContent(headJSFiles));
    }
    if (jsFiles) {
      $('body').append(this.getScriptsContent(jsFiles));
    }

    html = $.html();
    html = prettier.format(html, {
      parser: 'html',
    });

    return html;
  }
}

export default Html;
