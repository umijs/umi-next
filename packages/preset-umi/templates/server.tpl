import ReactDOMServer from 'react-dom/server';
import { getClientRootComponent } from '{{{ rendererPath }}}/dist/index.js';
import { getRoutes } from './core/route';
import { createPluginManager } from './core/plugin';
import { PluginManager } from '{{{ umiPath }}}/client/plugin.js';

export function getPlugins() {
  return [];
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}

export default async function (req, res, next) {
  const pluginManager = PluginManager.create({
    plugins: getPlugins(),
    validKeys: getValidKeys(),
  });
  const { routes, routeComponents } = await getRoutes(pluginManager);
  const context = {
    routes,
    routeComponents,
    pluginManager,
    location: req.url
  };

  // TODO: only the paths need rendered in the server can continue
  if(req.url.endsWith('.js') || req.url.endsWith('.css')) {
    next();
    return;
  }

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
<script src="/umi.js"></script>
</body></html>`);
};
