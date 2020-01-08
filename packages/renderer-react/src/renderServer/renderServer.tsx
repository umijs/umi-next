import React from 'react';
import { StaticRouter } from 'react-router';
import { Plugin } from '@umijs/runtime';
import { IncomingMessage, ServerResponse } from 'http';
import * as urlUtils from 'url';
import ReactDOMServer from 'react-dom/server';
import renderRoutes from '../renderRoutes/renderRoutes';
import loadInitialProps from './loadInitialProps';

import { IRoute } from '../types';

interface RenderOpts<T> {
  staticMarkup?: boolean;
  customRender?: (element: React.ReactElement<T>) => string;
}

export interface RenderServerOpts<T> {
  req: IncomingMessage;
  res: ServerResponse;
  url: string;
  routes: IRoute[];
  plugin: Plugin;
  initialProps?: object;
  renderOpts?: RenderOpts<T>;
}

/**
 * render React Component in server-side with current path
 * output rootContainer html string
 */
export default async function renderServer<T = any>(
  opts: RenderServerOpts<T>,
): Promise<string> {
  const { req, res, initialProps, plugin, routes, url, renderOpts } = opts;
  const { staticMarkup = false } = renderOpts || {};

  const renderFunction =
    ReactDOMServer[staticMarkup ? 'renderToStaticMarkup' : 'renderToString'];

  const pathname = urlUtils.parse(url)?.pathname || '';
  const { match, data } = await loadInitialProps(routes, pathname, {
    req,
    res,
    isServer: true,
    initialProps,
  });

  const routeComponent = renderRoutes({ routes, plugin, extraProps: data });

  const rootContainer = renderFunction(
    <StaticRouter location={url}>{routeComponent}</StaticRouter>,
  );
  return rootContainer;
}
