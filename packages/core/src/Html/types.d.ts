import { IConfig, IRoute } from '..';

export interface IHTMLTag {
  [key: string]: string;
}

export interface IModifyHTML {
  (memo: any, args: any): Promise<any>;
}

export interface IAddHTML<T> {
  (memo: T, args: { route?: IRoute }): Promise<T>;
}

export interface IScript extends Partial<HTMLScriptElement> {
  content?: string;
}
export interface IStyle extends Partial<HTMLStyleElement> {
  content: string;
}

export type IScriptConfig = Array<IScript | string>;
export type IStyleConfig = Array<IStyle | string>;

export interface IOpts {
  config: IConfig;
  tplPath?: string;
  addHTMLHeadScripts?: IAddHTML<IHTMLTag[]>;
  addHTMLScripts?: IAddHTML<IHTMLTag[]>;
  addHTMLMetas?: IAddHTML<IHTMLTag[]>;
  addHTMLLinks?: IAddHTML<IHTMLTag[]>;
  addHTMLStyles?: IAddHTML<IHTMLTag[]>;
  modifyHTML?: IModifyHTML;
}

export interface ILink {
  [key: string]: string;
}

export interface IStyle {
  [key: string]: string;
}

export interface IHtmlConfig {
  metas?: IHTMLTag[];
  links?: ILink[];
  styles?: IStyle[];
  headScripts?: IHTMLTag[];
  scripts?: IHTMLTag[];
}

export interface IGetContentArgs extends IHtmlConfig {
  route: IRoute;
  headJSFiles?: string[];
  jsFiles?: string[];
  cssFiles?: string[];
  tplPath?: string;
}
