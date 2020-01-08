export {
  Link,
  NavLink,
  Prompt,
  Redirect,
  Route,
  Router,
  MemoryRouter,
  Switch,
  match,
  matchPath,
  withRouter,
  useHistory,
  useLocation,
  useParams,
  useRouteMatch,
  StaticRouter,
} from 'react-router-dom';
export { matchRoutes } from 'react-router-config';
export { __RouterContext } from 'react-router';

export {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
} from 'history';

export { default as Plugin, ApplyPluginsType } from './Plugin/Plugin';
export { default as dynamic } from './dynamic/dynamic';

// @ts-ignore
// export * from '@@/umiExports';
