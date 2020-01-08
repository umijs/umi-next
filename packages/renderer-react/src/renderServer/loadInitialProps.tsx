import React from 'react';
import { matchRoutes, match } from '@umijs/runtime';
import { isPromise } from './utils';
import { IRoute, SSRInitialProps, IComponent } from '../types';

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
  ctx: any,
): Promise<IResult> {
  const promises: any[] = [];
  const data = {};

  const matchedComponents = matchRoutes(routes, pathname)
    .map(matchRoute => {
      const { route, match } = matchRoute as {
        route: IMatchRoute;
        match: match;
      };
      if (match && route.component?.getInitialProps) {
        const component = route.component;
        promises.push({
          path: route.path,
          promise: component.preload
            ? component
                .preload()
                .then(() => component?.getInitialProps?.({ match, ...ctx }))
            : component?.getInitialProps?.({ match, ...ctx }),
        });
      }
      return match;
    })
    .filter(c => c);

  const matchedComponent = matchedComponents[matchedComponents.length - 1];

  for (const promiseObj of promises) {
    const { path, promise } = promiseObj;
    if (isPromise(promise)) {
      const props = await promise;
      data[path] = props;
    }
  }

  return {
    match: matchedComponent,
    data,
  };
}
