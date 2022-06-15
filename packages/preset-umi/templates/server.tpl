import { getClientRootComponent } from '{{{ serverRendererPath }}}';
import { getRoutes } from './core/route';
import { PluginManager } from '{{{ umiPluginPath }}}';
import createRequestHandler from '{{{ umiServerPath }}}';

const routesWithServerLoader = {
{{#routesWithServerLoader}}
  '{{{ id }}}': () => import('{{{ path }}}'),
{{/routesWithServerLoader}}
};

export function getPlugins() {
  return [];
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}

const requestHandler = createRequestHandler({
  routesWithServerLoader,
  PluginManager,
  getPlugins,
  getValidKeys,
  getRoutes,
  manifest: __WEBPACK_MANIFEST__,
  getClientRootComponent
});

export default requestHandler;
