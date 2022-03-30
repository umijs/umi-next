import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { AppContext } from './appContext';
import { Routes } from './browser';
import { createClientRoutesWithoutLoading } from './routes';
import { IRouteComponents, IRoutesById } from './types';

// Get the root React component for ReactDOMServer.renderToString
export async function getClientRootComponent(opts: {
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  location: string;
  loaderData: { [routeKey: string]: any };
}) {
  const basename = '/';
  const components = { ...opts.routeComponents };
  await Promise.all(
    Object.keys(components).map(async (c) => {
      components[c] = (await components[c]()).default;
    }),
  );
  const clientRoutes = createClientRoutesWithoutLoading({
    routesById: opts.routes,
    routeComponents: components,
  });
  let rootContainer = (
    <StaticRouter basename={basename} location={opts.location}>
      <Routes />
    </StaticRouter>
  );
  for (const key of [
    // Lowest to the highest priority
    'innerProvider',
    'i18nProvider',
    'accessProvider',
    'dataflowProvider',
    'outerProvider',
    'rootContainer',
  ]) {
    rootContainer = opts.pluginManager.applyPlugins({
      type: 'modify',
      key: key,
      initialValue: rootContainer,
      args: {},
    });
  }
  return (
    <AppContext.Provider
      value={{
        routes: opts.routes,
        routeComponents: opts.routeComponents,
        clientRoutes,
        pluginManager: opts.pluginManager,
        basename,
        clientLoaderData: {},
        loaderData: opts.loaderData,
      }}
    >
      {rootContainer}
    </AppContext.Provider>
  );
}
