import React from 'react';
import ReactDOM from 'react-dom';
import { history, plugin } from '@/.umi-test/core/umiExports';
import { ApplyPluginsType } from '/Users/jcl/github/umi/umi-next/packages/runtime/dist/index.js';
import { renderClient } from '/Users/jcl/github/umi/umi-next/packages/renderer-react/dist/index.js';

let clientRender = function() {
  renderClient({
    routes: require('./core/routes').default,
    plugin,
    history,
    rootElement: 'root',
  });
};
clientRender = plugin.applyPlugins({
  key: 'render',
  type: ApplyPluginsType.compose,
  initialValue: clientRender,
  args: {},
});

// hot module replacement
if (module.hot) {
  module.hot.accept('./router', () => {
    clientRender();
  });
}
