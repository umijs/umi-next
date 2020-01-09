import React, { useEffect, useState } from 'react';
import { Plugin, Redirect, RouteComponentProps } from '@umijs/runtime';
import { IRoute, IGetInitialPropsClient, IComponent } from '../types';
import Switch from './Switch';
import Route from './Route';

interface IOpts {
  routes: IRoute[];
  plugin: Plugin;
  extraProps?: object;
}

interface IGetRouteElementOpts {
  route: IRoute;
  index: number;
  opts: IOpts;
}

function wrapInitialPropsFetch(
  WrappedComponent: any,
  WrappedComponentProps: object,
): any {
  return function Foo(props: RouteComponentProps) {
    const [initialProps, setInitialProps] = useState(WrappedComponentProps);
    useEffect(() => {
      (async () => {
        const getInitialProps: IGetInitialPropsClient = {
          isServer: false,
          ...props,
        };
        const initialProps = await WrappedComponent!.getInitialProps!(
          getInitialProps,
        );
        setInitialProps(initialProps);
      })();
    }, []);
    return <WrappedComponent {...props} {...initialProps} />;
  };
}

// TODO: custom Switch
// 1. keep alive
function render({
  route,
  opts,
  props,
}: {
  route: IRoute;
  opts: IOpts;
  props: RouteComponentProps;
}) {
  const routes = renderRoutes({
    ...opts,
    routes: route.routes || [],
  });

  let { component: Component, Routes, path } = route;
  if (Component) {
    if (Component.getInitialProps) {
      const initialProps = opts?.extraProps?.[path as string] || {};
      Component = wrapInitialPropsFetch(Component, initialProps) as IComponent;
    }

    if (Routes) {
      // TODO: Routes 更名
      // TODO: 用 Routes 封装 Component
    }

    const newProps = {
      ...props,
      route,
    };
    return <Component {...newProps}>{routes}</Component>;
  } else {
    return routes;
  }
}

function getRouteElement({ route, index, opts }: IGetRouteElementOpts) {
  const routeProps = {
    key: route.key || index,
    exact: route.exact,
    strict: route.strict,
    sensitive: route.sensitive,
    path: route.path,
  };
  if (route.redirect) {
    return <Redirect {...routeProps} from={route.path} to={route.redirect} />;
  } else {
    return (
      <Route
        {...routeProps}
        render={(props: any) => {
          return render({ route, opts, props });
        }}
      />
    );
  }
}

export default function renderRoutes(opts: IOpts) {
  return opts.routes ? (
    <Switch>
      {opts.routes.map((route, index) =>
        getRouteElement({
          route,
          index,
          opts,
        }),
      )}
    </Switch>
  ) : null;
}
