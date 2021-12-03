// @ts-ignore
import loadable from '@loadable/component';
import { Location } from 'history';
import React from 'react';
import { Navigator, Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppContext } from './appContext';
import { createClientRoutes } from './routes';
import { IRoutesById } from './types';

export function App(props: {
  navigator: Navigator;
  location: Location;
  routes: IRoutesById;
  routeComponents: Record<string, any>;
  pluginManager: any;
}) {
  const clientRoutes = React.useMemo(() => {
    return createClientRoutes({
      routesById: props.routes,
      Component: RouteComponent,
    });
  }, [props.routes]);
  let ret = (
    <AppContext.Provider
      value={{
        routes: props.routes,
        routeComponents: props.routeComponents,
        pluginManager: props.pluginManager,
        clientRoutes,
      }}
    >
      <Router navigator={props.navigator} location={props.location}>
        <Routes />
      </Router>
    </AppContext.Provider>
  );
  for (const key of [
    'innerProvider',
    'i18nProvider',
    'dataflowProvider',
    'outerProvider',
  ]) {
    ret = props.pluginManager.applyPlugins({
      type: 'modify',
      key: key,
      initialValue: ret,
    });
  }
  return ret;
}

function Routes() {
  const { clientRoutes } = useAppContext();
  return useRoutes(clientRoutes) || clientRoutes[0].element;
}

function Loading() {
  return <div>Loading...</div>;
}

export function RouteComponent(props: { id: string }) {
  const loader = useAppContext().routeComponents[props.id];
  const RouteComponent = loadable(loader, {
    fallback: <Loading />,
  });

  // ref: https://reactjs.org/docs/code-splitting.html
  return <RouteComponent />;
}
