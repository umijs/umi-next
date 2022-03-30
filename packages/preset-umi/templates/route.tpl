import clientLoaders from './loaders.js';

export async function getRoutes() {
  return {
    routes: {{{ routes }}},
    routeComponents: {{{ routeComponents }}},
  };
}
