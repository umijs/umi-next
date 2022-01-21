import React from 'react';
import { useThemeContext } from './context';

export default () => {
  const { location, appData } = useThemeContext()!;
  const route = appData.routes[location.pathname.slice(1)];

  if (!route) {
    return null;
  }

  const titles = route.titles.filter((t: any) => t.level > 1);
  return (
    <div
      className="w-full lg:mx-12 mb-12 border
      border-gray-100 p-8 rounded-xl z-20"
    >
      <ul>
        {titles.map((item: any) => {
          return <li>{item.title}</li>;
        })}
      </ul>
    </div>
  );
};
