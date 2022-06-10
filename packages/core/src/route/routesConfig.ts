import assert from 'assert';

interface IOpts {
  routes: any[];
  onResolveComponent?: (component: string) => string;
}

interface IMemo {
  id: number;
  ret: any;
}

export function getConfigRoutes(opts: IOpts): any[] {
  const memo: IMemo = { ret: {}, id: 1 };
  transformRoutes({
    routes: opts.routes,
    parentId: undefined,
    memo,
    onResolveComponent: opts.onResolveComponent,
  });
  return memo.ret;
}

function transformRoutes(opts: {
  routes: any[];
  parentId: undefined | string;
  memo: IMemo;
  onResolveComponent?: Function;
}) {
  opts.routes.forEach((route) => {
    transformRoute({
      route,
      parentId: opts.parentId,
      memo: opts.memo,
      onResolveComponent: opts.onResolveComponent,
    });
  });
}

function transformRoute(opts: {
  route: any;
  parentId: undefined | string;
  memo: IMemo;
  onResolveComponent?: Function;
}) {
  assert(
    !opts.route.children,
    'children is not allowed in route props, use routes instead.',
  );
  const id = String(opts.memo.id++);
  const { routes, component, wrappers, ...routeProps } = opts.route;
  let absPath = opts.route.path;
  if (absPath?.charAt(0) !== '/') {
    const parentAbsPath = opts.parentId
      ? opts.memo.ret[opts.parentId].absPath.replace(/\/+$/, '/') // to remove '/'s on the tail
      : '/';
    absPath = parentAbsPath + absPath;
  }
  opts.memo.ret[id] = {
    ...routeProps,
    path: opts.route.path,
    ...(component
      ? {
          file: opts.onResolveComponent?.(component) ?? component,
        }
      : {}),
    parentId: opts.parentId,
    id,
  };
  if (absPath) {
    opts.memo.ret[id].absPath = absPath;
  }
  if (wrappers?.length) {
    opts.memo.ret[id].wrappers = wrappers.map(
      (w: string) => opts.onResolveComponent?.(w) ?? w,
    );
  }
  if (opts.route.routes) {
    transformRoutes({
      routes: opts.route.routes,
      parentId: id,
      memo: opts.memo,
      onResolveComponent: opts.onResolveComponent,
    });
  }
  return { id };
}
