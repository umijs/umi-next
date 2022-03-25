import { History } from 'history';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { matchRoutes, Router, useRoutes } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import { AppContext, useAppData } from './appContext';
import { createClientRoutes, createClientRoutesWithoutLoading } from './routes';
import { ILoaderData, IRouteComponents, IRoutesById } from './types';

function BrowserRoutes(props: {
  routes: any;
  clientRoutes: any;
  pluginManager: any;
  history: History;
  basename: string;
  children: any;
}) {
  const { history } = props;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });
  React.useLayoutEffect(() => history.listen(setState), [history]);
  React.useLayoutEffect(() => {
    function onRouteChange(opts: any) {
      props.pluginManager.applyPlugins({
        key: 'onRouteChange',
        type: 'event',
        args: {
          routes: props.routes,
          clientRoutes: props.clientRoutes,
          location: opts.location,
          action: opts.action,
        },
      });
    }

    history.listen(onRouteChange);
    onRouteChange({ location: state.location, action: state.action });
  }, [history, props.routes, props.clientRoutes]);
  return (
    <Router
      navigator={history}
      location={state.location}
      basename={props.basename}
    >
      {props.children}
    </Router>
  );
}

function Routes() {
  const { clientRoutes } = useAppData();
  return useRoutes(clientRoutes);
}

export function renderClient(opts: {
  rootElement?: HTMLElement;
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  clientLoaders?: { executeClientLoader: (routeKey: string) => Promise<any> };
  basename?: string;
  loadingComponent?: React.ReactNode;
  history: History;
}) {
  const basename = opts.basename || '/';
  const rootElement = opts.rootElement || document.getElementById('root');
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
    loadingComponent: opts.loadingComponent,
  });
  let rootContainer = (
    <BrowserRoutes
      basename={basename}
      pluginManager={opts.pluginManager}
      routes={opts.routes}
      clientRoutes={clientRoutes}
      history={opts.history}
    >
      <Routes />
    </BrowserRoutes>
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

  function Browser() {
    const [clientLoaderData, setClientLoaderData] = useState<ILoaderData>({});
    // @ts-ignore
    const [loaderData, setLoaderData] = useState<ILoaderData>(
      window.__UMI_LOADER_DATA__,
    );
    useEffect(() => {
      return opts.history.listen((e) => {
        const matches =
          matchRoutes(clientRoutes, e.location.pathname)?.map(
            // @ts-ignore
            (route) => route.route.id,
          ) || [];
        matches.map((match) => {
          if (opts.routes[match].hasLoader) {
            fetch('/__umi?route=' + match)
              .then((d) => d.json())
              .then((data) => {
                setLoaderData((d) => ({ ...d, [match]: data }));
              })
              .catch(console.error);
          }
          opts.clientLoaders?.executeClientLoader(match).then((data) => {
            setClientLoaderData((d) => ({ ...d, [match]: data }));
          });
        });
      });
    }, []);

    useEffect(() => {
      // @ts-ignore
      window.__UMI_SERVER_RENDERED_ROUTES__?.map((match) => {
        opts.clientLoaders?.executeClientLoader(match).then((data) => {
          setClientLoaderData((d) => ({ ...d, [match]: data }));
        });
      });
    }, []);

    return (
      <AppContext.Provider
        value={{
          routes: opts.routes,
          routeComponents: opts.routeComponents,
          clientRoutes,
          pluginManager: opts.pluginManager,
          rootElement: opts.rootElement,
          basename,
          loaderData,
          clientLoaderData,
        }}
      >
        {rootContainer}
      </AppContext.Provider>
    );
  }

  // @ts-ignore
  if (ReactDOM.createRoot) {
    // @ts-ignore
    ReactDOM.createRoot(rootElement).render(<Browser />);
  } else {
    ReactDOM.render(<Browser />, rootElement);
  }
}

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
