import React from 'react';
import { useRouteData } from './routeContext';

export const AppContext = React.createContext<any>(null);

export function useAppData(): any {
  return React.useContext(AppContext);
}

export function useLoaderData() {
  const route = useRouteData();
  const appData = useAppData();
  return appData.loaderData[route.route.id];
}
