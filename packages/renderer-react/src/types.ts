export interface IRoute {
  id: string;
  path?: string;
  index?: boolean;
  parentId?: string;
  redirect?: string;

  // route has server-side loader
  hasLoader?: boolean;

  // route's client loader (for data pre-fetch)
  loader?: () => Promise<any>;
}

export interface IRoutesById {
  [id: string]: IRoute;
}

export interface IRouteComponents {
  [id: string]: any;
}

export interface ILoaderData {
  [routeKey: string]: any;
}
