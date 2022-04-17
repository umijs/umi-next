import { IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
}) {
  const { routesById, parentId, routeComponents } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        routeComponent: routeComponents[id],
      });

      const children = createClientRoutes({
        routesById,
        routeComponents,
        parentId: route.id,
      });

      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
      }

      delete route.id;

      return route;
    });
}

export function createClientRoute(opts: {
  route: IRoute;
  routeComponent: any;
}) {
  const { route } = opts;
  const { id, path, redirect } = route;

  if (redirect) {
    return {
      id,
      path,
      redirect,
    };
  }

  const item: Record<string, any> = { id, component: opts.routeComponent };

  if (path) {
    item.path = path;
  }
  return item;
}
