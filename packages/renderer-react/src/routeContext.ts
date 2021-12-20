import React from 'react';

export interface IRouteContextType {
  route: any;
}
export const RouteContext = React.createContext<IRouteContextType | undefined>(
  undefined,
);

export function useRouteData(): IRouteContextType {
  return React.useContext(RouteContext)!;
}
