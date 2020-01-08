import React from 'react';
import { matchRoutes } from 'react-router-config';
import { isPromise } from './utils';
import { IRoute, SSRInitialProps } from '../types';

export interface InitialProps {
  match?: React.ComponentType<any>;
  data: Promise<any>[];
}

export interface AsyncComponent {
  getInitialProps: (props: any) => any;
  preload?: () => Promise<React.ReactNode>;
}

interface Result {
  data: SSRInitialProps;
  match: React.ReactElement;
}

export default async function loadInitialProps(
  routes: IRoute[],
  pathname: string,
  ctx: any,
): Promise<Result> {
  const promises: any[] = [];
  const data = {};

  const matchedComponents = matchRoutes(routes, pathname)
    .map(({ route, match }) => {
      if (match && route.component?.getInitialProps) {
        const component = route.component;
        promises.push({
          path: route.path,
          promise: component.preload
            ? component
                .preload()
                .then(() => component.getInitialProps({ match, ...ctx }))
            : component.getInitialProps({ match, ...ctx }),
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
