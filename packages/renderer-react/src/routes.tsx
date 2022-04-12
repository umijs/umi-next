// @ts-ignore
import loadable from '@loadable/component';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { RouteContext, useRouteData } from './routeContext';
import { IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
  loadingComponent?: React.ReactNode;
}) {
  const { routesById, parentId, routeComponents } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        routeComponent: routeComponents[id],
        loadingComponent: opts.loadingComponent,
      });
      const children = createClientRoutes({
        routesById,
        routeComponents,
        parentId: route.id,
        loadingComponent: opts.loadingComponent,
      });
      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
        // TODO: remove me
        // compatible with @ant-design/pro-layout
        // @ts-ignore
        route.routes = children;
      }
      return route;
    });
}

export function createClientRoute(opts: {
  route: IRoute;
  routeComponent: any;
  loadingComponent?: React.ReactNode;
}) {
  const { route } = opts;
  const { id, path, index, redirect, ...props } = route;
  return {
    id: id,
    path: path,
    index: index,
    element: redirect ? (
      <Navigate to={redirect} />
    ) : (
      <RouteContext.Provider
        value={{
          route: opts.route,
        }}
      >
        <RemoteComponent
          loader={opts.routeComponent}
          loadingComponent={opts.loadingComponent || DefaultLoading}
        />
      </RouteContext.Provider>
    ),
    ...props,
  };
}

export function createClientRoutesWithoutLoading(opts: {
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
}) {
  const { routesById, parentId, routeComponents } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRouteWithoutLoading({
        route: routesById[id],
        routeComponent: routeComponents[id],
      });
      const children = createClientRoutesWithoutLoading({
        routesById,
        routeComponents,
        parentId: route.id,
      });
      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
        // TODO: remove me
        // compatible with @ant-design/pro-layout
        // @ts-ignore
        route.routes = children;
      }
      return route;
    });
}

export function createClientRouteWithoutLoading(opts: {
  route: IRoute;
  routeComponent: any;
}) {
  const { route } = opts;
  const { id, path, index, redirect, ...props } = route;
  return {
    id: id,
    path: path,
    index: index,
    element: (
      <RouteContext.Provider value={{ route: opts.route }}>
        <opts.routeComponent />
      </RouteContext.Provider>
    ),
    ...props,
  };
}

function DefaultLoading() {
  const route = useRouteData();
  return (
    <div style={{ margin: 32 }}>
      Route Component
      <code
        style={{
          backgroundColor: '#eee',
          margin: '0 4px',
          padding: '1px 2px',
        }}
      >
        {route.route.file}
      </code>
      is Loading ...
    </div>
  );
}

function RemoteComponent(props: any) {
  const Component = loadable(props.loader, {
    fallback: <props.loadingComponent />,
  });
  return <Component />;
}
