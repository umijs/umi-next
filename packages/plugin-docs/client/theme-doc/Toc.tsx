import React from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';

export default () => {
  const { location, appData } = useThemeContext()!;
  const lang = useLanguage();
  const route =
    appData.routes[
      lang.isFromPath
        ? location.pathname.split('/').slice(2).join('/') +
          '.' +
          lang.currentLanguage?.locale
        : location.pathname.slice(1)
    ];

  if (!route) {
    return null;
  }

  const titles = route.titles.filter((t: any) => t.level > 1);
  return (
    <div
      className="w-full lg:m-12 mb-12 border
      border-gray-100 p-8 rounded-xl z-20"
    >
      <p className="text-lg font-extrabold dark:text-white">
        {route.titles[0].title}
      </p>
      <ul className="max-h-[calc(100vh-360px)] overflow-y-scroll fadeout py-2">
        {titles.map((item: any) => {
          return (
            <li
              className="mt-3 text-gray-600 cursor-pointer dark:text-gray-400
              hover:text-blue-500 transition duration-300 dark:hover:text-blue-500"
            >
              <a href={'#' + item.title}>{item.title}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
