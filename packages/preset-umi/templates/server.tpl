import { getClientRootComponent } from '{{{ rendererPath }}}';
import { getRoutes } from './core/route';
import { PluginManager } from '{{{ umiPath }}}/client/plugin.js';
import createRequestHandler from '{{{ umiServerPath }}}';
import { resolve } from 'path';

const routeLoaders = {
{{#routeLoaders}}
  '{{{ name }}}': () => import('{{{ path }}}'),
{{/routeLoaders}}
};

export function getPlugins() {
  return [];
}

export function getValidKeys() {
  return [{{#validKeys}}'{{{ . }}}',{{/validKeys}}];
}

const requestHandler = createRequestHandler({
  routeLoaders,
  PluginManager,
  getPlugins,
  getValidKeys,
  getRoutes,
  manifest: __WEBPACK_MANIFEST__,
  getClientRootComponent
});

export default requestHandler;
