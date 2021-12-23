import React from 'react';
// @ts-ignore
import { _LocaleContainer } from './locale';
import { getIntl, getLocale } from './localeExports';

export function rootContainer(container: Element) {
  return React.createElement(_LocaleContainer, null, container);
}

{{#Title}}
export function patchRoutes({ routes }) {
  // loop all route for patch title field
  const intl = getIntl(getLocale());
  const traverseRoute = (routes) => {
    routes.forEach(route => {
      if (route.title) {
        route.title = intl.messages[route.title] ? intl.formatMessage({ id: route.title }, {}) : route.title;
      }
      if (route.routes) {
        traverseRoute(route.routes);
      }
    })
  }
  traverseRoute(routes);
}
{{/Title}}
