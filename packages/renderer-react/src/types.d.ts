import { FunctionComponent } from 'react';
import { Location, match, History } from '@umijs/runtime';
import { IncomingMessage, ServerResponse } from 'http';

export interface IComponent extends FunctionComponent {
  getInitialProps?: Function;
  preload?: () => Promise<() => IComponent>;
}

export interface IRoute {
  path?: string;
  exact?: boolean;
  redirect?: string;
  component?: IComponent;
  routes?: IRoute[];
  key?: any;
  strict?: boolean;
  sensitive?: boolean;
  Routes?: any[];
}

export interface IGetInitialProps {
  isServer: boolean;
  match: match;
}

export interface IGetInitialPropsServer extends IGetInitialProps {
  req?: IncomingMessage;
  res?: ServerResponse;
}

export interface IGetInitialPropsClient extends IGetInitialProps {
  location?: Location;
}

export interface SSRInitialProps {
  [path: string]: object;
}
