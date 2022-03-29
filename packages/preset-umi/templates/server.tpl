import ReactDOMServer from 'react-dom/server';
import { getClientRootComponent } from '{{{ rendererPath }}}/dist/index.js';
import { getRoutes } from './core/route';
import { createPluginManager } from './core/plugin';
import { PluginManager } from '{{{ umiPath }}}/client/plugin.js';
import { matchRoutes } from "react-router";

const routeLoaders = {{{ routeLoaders }}};

export function getPlugins() {
  return [];
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}

async function executeLoader(routeKey: string) {
  const mod = await routeLoaders[routeKey]();
  if (!mod.loader) {
    return;
  }
  const data = await mod.loader();
  return data;
}

export default async function (req, res, next) {

  if(req.url.startsWith('/__umi')) {
    const data = await executeLoader(req.query.route);
    res.status(200).json(data);
    return;
  }

  const pluginManager = PluginManager.create({
    plugins: getPlugins(),
    validKeys: getValidKeys(),
  });
  const { routes, routeComponents } = await getRoutes(pluginManager);

  const matches = matchRoutesForSSR(req.url, routes);
  if(matches.length === 0) {
    next();
    return;
  }

  const loaderData = { };
  await Promise.all(matches.map(match => new Promise(async (resolve, reject) => {
    const data = await executeLoader(match);
    loaderData[match] = data;
    resolve();
  })));

  const context = {
    routes,
    routeComponents,
    pluginManager,
    location: req.url,
    loaderData
  };

  res.end(
  `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="ie=edge">
</head>
<body>
<div id="root" data-reactroot="">
${ReactDOMServer.renderToStaticMarkup(await getClientRootComponent(context))}
</div>
<script>window.__UMI_LOADER_DATA__ = ${JSON.stringify(context.loaderData)}</script>
<script>window.__UMI_SERVER_RENDERED_ROUTES__ = ${JSON.stringify(matches)}</script>
<script src="/umi.js"></script>
</body></html>`);
};

export function matchRoutesForSSR(reqUrl, routesById) {
  return matchRoutes(createClientRoutes({ routesById }), reqUrl)?.map(route => route.route.id) || [];
}

export function createClientRoutes(opts) {
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

export function createClientRoute(route) {
  const { id, path, index } = route;
  return {
    id: id,
    path: path,
    index: index,
  };
}
