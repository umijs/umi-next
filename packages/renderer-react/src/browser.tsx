import { History } from 'history';
import React, { startTransition, useEffect, useState } from 'react';
// compatible with < react@18 in @umijs/preset-umi/src/features/react
import { createRoot, hydrateRoot } from 'react-dom/client';
import { matchRoutes, Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppData } from './appContext';
import { createClientRoutes } from './routes';
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

export function Routes() {
  const { clientRoutes } = useAppData();
  return useRoutes(clientRoutes);
}

export function renderClient(opts: {
  rootElement?: HTMLElement;
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  basename?: string;
  loadingComponent?: React.ReactNode;
  history: History;
  hydrate?: boolean;
}) {
  const basename = opts.basename || '/';
  let rootElement = opts.rootElement || document.getElementById('root');
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
    loadingComponent: opts.loadingComponent,
  });
  opts.pluginManager.applyPlugins({
    key: 'patchClientRoutes',
    type: 'event',
    args: {
      routes: clientRoutes,
    },
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
    const [loaderData, setLoaderData] = useState<ILoaderData>(
      // @ts-ignore
      window.__UMI_LOADER_DATA__ || {},
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
                startTransition(() => {
                  setLoaderData((d) => ({ ...d, [match]: data }));
                });
              })
              .catch(console.error);
          }
          const clientLoader = opts.routes[match].loader;
          if (clientLoader)
            clientLoader().then((data) => {
              startTransition(() => {
                setClientLoaderData((d) => ({ ...d, [match]: data }));
              });
            });
        });
      });
    }, []);

    useEffect(() => {
      // @ts-ignore
      window.__UMI_SERVER_RENDERED_ROUTES__?.map((match) => {
        const clientLoader = opts.routes[match].loader;
        if (clientLoader)
          clientLoader().then((data) => {
            startTransition(() => {
              setClientLoaderData((d) => ({ ...d, [match]: data }));
            });
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

  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
  }

  if (opts.hydrate) {
    hydrateRoot(rootElement, <Browser />);
  } else {
    const root = createRoot(rootElement);
    root.render(<Browser />);
  }
}
