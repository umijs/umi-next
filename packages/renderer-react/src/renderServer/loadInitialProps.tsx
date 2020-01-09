import React from 'react';
import { matchRoutes, match } from '@umijs/runtime';
import { isPromise } from './utils';
import {
  IRoute,
  SSRInitialProps,
  IComponent,
  IGetInitialPropsServer,
} from '../types';

export interface InitialProps {
  match?: React.ComponentType<any>;
  data: Promise<any>[];
}

interface IResult {
  data: SSRInitialProps;
  match: match;
}

interface IMatchRoute extends IRoute {
  component: IComponent;
}

export default async function loadInitialProps(
  routes: IRoute[],
  pathname: string,
  ctx: Pick<IGetInitialPropsServer, 'req' | 'res' | 'isServer'>,
): Promise<IResult> {
  const promises: any[] = [];
  const data = {};

  const matchedComponents = matchRoutes(routes, pathname)
    .map(matchRoute => {
      const { route, match } = matchRoute as {
        route: IMatchRoute;
        match: match;
      };
      if (match) {
        const component = route.component;
        const getInitialProps: IGetInitialPropsServer = {
          match,
          ...ctx,
        };
        promises.push({
          path: route.path,
          promise: component.preload
            ? component
                .preload()
                .then(() => component?.getInitialProps?.(getInitialProps))
            : component?.getInitialProps?.(getInitialProps),
        });
      }
      return match;
    })
    .filter(c => c);

  const matchedComponent = matchedComponents[matchedComponents.length - 1];

  for (const promiseObj of promises) {
    const { path, promise } = promiseObj;
    const props = isPromise(promise) ? await promise : promise;
    data[path] = props;
  }

  return {
    match: matchedComponent,
    data,
  };
}
