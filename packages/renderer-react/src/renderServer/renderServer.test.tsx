import React from 'react';
import { Plugin } from '@umijs/runtime';
import renderServer from './renderServer';
import TestInitial from './fixtures/TestInitial';
import TestInitialParent from './fixtures/TestInitialParent';
import TestInitialSync from './fixtures/TestInitialSync';
import Layout from './fixtures/Layout';
import News from './fixtures/News';
import NewsDetail from './fixtures/NewsDetail';

describe('renderServer', () => {
  it('normal', async () => {
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

  it('getInitialProps', async () => {
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
          component: TestInitialParent,
          routes: [
            {
              path: '/get-initial-props-embed',
              component: TestInitial,
            },
            {
              path: '/get-initial-synchronous',
              component: TestInitialSync,
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

  it('dynamic Route', async () => {
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
          component: Layout,
          routes: [
            {
              path: '/news/:id',
              component: NewsDetail,
            },
            {
              path: '/news',
              component: News,
            },
          ],
        },
      ],
    } as any;

    expect(
      await renderServer({
        ...commonOpts,
        url: '/',
      }),
    ).toEqual('<div><h1>Layout</h1><div class="children"></div></div>');

    expect(
      await renderServer({
        ...commonOpts,
        url: '/news',
      }),
    ).toEqual(
      '<div><h1>Layout</h1><div class="children"><ul><li>title1</li><li>title2</li></ul></div></div>',
    );

    expect(
      await renderServer({
        ...commonOpts,
        url: '/news/2',
      }),
    ).toEqual(
      '<div><h1>Layout</h1><div class="children"><div><p>currentId: 2</p><p>description2</p></div></div></div>',
    );
  });
});
