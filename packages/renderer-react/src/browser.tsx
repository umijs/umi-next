import { History } from 'history';
import React, { useEffect, useState } from 'react';
// compatible with < react@18 in @umijs/preset-umi/src/features/react
import ReactDOM from 'react-dom/client';
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

function Routes() {
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
}) {
  const basename = opts.basename || '/';
  const rootElement = opts.rootElement || document.getElementById('root')!;
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
  const Browser = () => {
    const [clientLoaderData, setClientLoaderData] = useState<ILoaderData>({});
    useEffect(() => {
      function handleRouteChange(p: string) {
        const matches =
          matchRoutes(clientRoutes, p)?.map(
            // @ts-ignore
            (route) => route.route.id,
          ) || [];
        matches.map((match) => {
          // @ts-ignore
          const manifest = window.__umi_manifest__;
          if (manifest) {
            const id = 'preload-' + match.replace(/\//g, '_');
            if (!document.getElementById(id)) {
              const key = Object.keys(manifest).find((k) =>
                k.startsWith(match.replace(/\//g, '_') + '.'),
              );
              if (!key) return;
              const file = manifest[key];
              const link = document.createElement('link');
              link.id = id;
              link.rel = 'preload';
              link.as = 'script';
              // TODO: public path may not be root
              link.href = file;
              document.head.appendChild(link);
            }
          }
          const clientLoader = opts.routes[match].clientLoader;
          if (clientLoader)
            clientLoader().then((data: any) => {
              setClientLoaderData((d: any) => ({ ...d, [match]: data }));
            });
        });
      }

      handleRouteChange(window.location.pathname);
      return opts.history.listen((e) => {
        handleRouteChange(e.location.pathname);
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
          clientLoaderData,
        }}
      >
        {rootContainer}
      </AppContext.Provider>
    );
  };

  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(rootElement).render(<Browser />);
  } else {
    // @ts-ignore
    ReactDOM.render(browser, rootElement);
  }
}
