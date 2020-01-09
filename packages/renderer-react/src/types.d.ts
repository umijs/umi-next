import { FunctionComponent } from 'react';
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
  req?: IncomingMessage;
  res?: ServerResponse;
  isServer?: boolean;
}

export interface SSRInitialProps {
  [path: string]: object;
}
