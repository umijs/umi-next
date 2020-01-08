import React from 'react';
import { Plugin } from '@umijs/runtime';
import renderServer from './renderServer';

function TestInitialProps({ foo }: { foo: string }) {
  return <h2>{foo}</h2>;
}

TestInitialProps.getInitialProps = async () => {
  return new Promise(resolve => {
    resolve({
      foo: 'bar',
    });
  });
};

function TestInitialPropsParent({
  foo,
  children,
}: {
  foo: string;
  children: any;
}) {
  return (
    <>
      <h1>{foo}</h1>
      {children}
    </>
  );
}

TestInitialPropsParent.getInitialProps = async () => {
  return new Promise(resolve => {
    resolve({
      foo: 'parent',
    });
  });
};

test('normal', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
    },
    path: '/foo',
  });
  const commonOpts = {
    req: {},
    res: {},
    plugin,
    initialProps: [],
    routes: [
      { path: '/foo', component: () => <h1>foo</h1> },
      { path: '/bar', component: () => <h1>bar</h1> },
      {
        path: '/news/:id',
        component: props => <h1>{props.match.params.id}</h1>,
      },
    ],
  } as any;
  expect(
    await renderServer({
      ...commonOpts,
      url: '/bar',
    }),
  ).toEqual('<h1>bar</h1>');

  expect(
    await renderServer({
      ...commonOpts,
      url: '/foo',
    }),
  ).toEqual('<h1>foo</h1>');

  expect(
    await renderServer({
      ...commonOpts,
      url: '/news/666',
    }),
  ).toEqual('<h1>666</h1>');
});

test('getInitialProps', async () => {
  const routeChanges: string[] = [];
  const plugin = new Plugin({
    validKeys: ['onRouteChange'],
  });
  plugin.register({
    apply: {
      onRouteChange({ location, action }: any) {
        routeChanges.push(`${action} ${location.pathname}`);
      },
    },
    path: '/foo',
  });
  const commonOpts = {
    req: {},
    res: {},
    plugin,
    initialProps: [],
    renderOpts: {
      staticMarkup: true,
    },
    routes: [
      {
        path: '/',
        component: TestInitialPropsParent,
        routes: [
          {
            path: '/get-initial-props-embed',
            component: TestInitialProps,
          },
        ],
      },
    ],
  } as any;

  expect(
    await renderServer({
      ...commonOpts,
      url: '/get-initial-props-embed',
    }),
  ).toEqual('<h1>parent</h1><h2>bar</h2>');
});
