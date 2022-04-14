import clientLoaders from './loaders.js';
import React from 'react';

export async function getRoutes() {
  return {
    routes: {{{ routes }}},
    routeComponents: {{{ routeComponents }}},
  };
}
