import ReactDOMServer from 'react-dom/server';
import { matchRoutes } from 'react-router';
import type { IRoutesById } from './types';

interface RouteLoaders {
  [key: string]: () => Promise<any>;
}

interface CreateRequestHandlerOptions {
  routeLoaders: RouteLoaders;
  PluginManager: any;
  getPlugins: () => any;
  getValidKeys: () => any;
  getRoutes: (PluginManager: any) => any;
  getClientRootComponent: (PluginManager: any) => any;
}

export default function createRequestHandler(
  opts: CreateRequestHandlerOptions,
) {
  return async function (req: any, res: any, next: any) {
    const { routeLoaders, PluginManager, getPlugins, getValidKeys, getRoutes } =
      opts;

    if (req.url.startsWith('/__umi') && req.query.route) {
      const data = await executeLoader(req.query.route, routeLoaders);
      res.status(200).json(data);
      return;
    }

    const pluginManager = PluginManager.create({
      plugins: getPlugins(),
      validKeys: getValidKeys(),
    });
    const { routes, routeComponents } = await getRoutes(pluginManager);

    const matches = matchRoutesForSSR(req.url, routes);
    if (matches.length === 0) {
      next();
      return;
    }

    const loaderData: { [key: string]: any } = {};
    await Promise.all(
      matches
        .filter((m: string) => routes[m].hasLoader)
        .map(
          (match: string) =>
            new Promise<void>(async (resolve) => {
              loaderData[match] = await executeLoader(match, routeLoaders);
              resolve();
            }),
        ),
    );

    const context = {
      routes,
      routeComponents,
      pluginManager,
      location: req.url,
      loaderData,
    };

    const jsx = await opts.getClientRootComponent(context);
    const html = ReactDOMServer.renderToStaticMarkup(jsx);

    res.end(
      `<!DOCTYPE html><html><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <link rel="stylesheet" href="/umi.css">
  </head>
  <body>
  <div id="root" data-reactroot="">
  ${html}
  </div>
  <script>window.__UMI_LOADER_DATA__ = ${JSON.stringify(
    context.loaderData,
  )}</script>
  <script>window.__UMI_SERVER_RENDERED_ROUTES__ = ${JSON.stringify(
    matches,
  )}</script>
  <script src="/umi.js"></script>
  </body></html>`,
    );
  };
}

function matchRoutesForSSR(reqUrl: string, routesById: IRoutesById) {
  return (
    matchRoutes(createClientRoutes({ routesById }), reqUrl)?.map(
      (route: any) => route.route.id,
    ) || []
  );
}

function createClientRoutes(opts: any) {
  const { routesById, parentId } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute(routesById[id]);
      const children = createClientRoutes({
        routesById,
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

function createClientRoute(route: any) {
  const { id, path, index } = route;
  return {
    id: id,
    path: path,
    index: index,
  };
}

async function executeLoader(routeKey: string, routeLoaders: RouteLoaders) {
  const mod = await routeLoaders[routeKey]();
  if (!mod.loader) {
    return;
  }
  return await mod.loader();
}
