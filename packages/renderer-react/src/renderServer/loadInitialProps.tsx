import React from 'react';
import { matchRoutes } from 'react-router-config';
import { isPromise } from './utils';
import { IRoute, SSRInitialProps, IComponent } from '../types';

export interface InitialProps {
  match?: React.ComponentType<any>;
  data: Promise<any>[];
}

interface Result {
  data: SSRInitialProps;
  match: React.ReactElement;
}

interface MatchRoute extends IRoute {
  component: IComponent;
}

export default async function loadInitialProps(
  routes: IRoute[],
  pathname: string,
  ctx: any,
): Promise<Result> {
  const promises: any[] = [];
  const data = {};

  const matchedComponents = matchRoutes(routes, pathname)
    .map(matchRoute => {
      const { route, match } = matchRoute as { route: MatchRoute; match: any };
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
