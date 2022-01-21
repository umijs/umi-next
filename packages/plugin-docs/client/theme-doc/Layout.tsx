import React from 'react';
import { ThemeContext } from './context';
import Head from './Head';
import Sidebar from './Sidebar';
import Toc from './Toc';

export default (props: any) => {
  return (
    <ThemeContext.Provider
      value={{
        appData: props.appData,
        components: props.components,
        themeConfig: props.themeConfig,
        location: props.location,
      }}
    >
      <div className="flex flex-col">
        <div
          className="z-30 sticky top-0 before:bg-white before:bg-opacity-[.85]
           before:backdrop-blur-md before:absolute before:block
           before:w-full before:h-full before:z-[-1]"
        >
          <Head />
        </div>

        <div className="w-full flex flex-row justify-center overflow-x-hidden">
          <div className="container flex flex-row justify-center">
            <div className="w-full lg:w-1/2 px-4 lg:px-0 m-8 z-20">
              <div className="lg:hidden">
                <Toc />
              </div>
              <article className="flex-1">{props.children}</article>
            </div>
          </div>
        </div>

        <div
          className="fixed left-0 top-0 w-1/4 flex flex-row
          justify-center h-screen z-10 pt-20"
        >
          <div className="container flex flex-row justify-end">
            <div className="hidden lg:block">
              <Sidebar />
            </div>
          </div>
        </div>

        <div
          className="fixed right-0 top-0 w-1/4 flex flex-row
           justify-center h-screen z-10 pt-20 hidden lg:block"
        >
          <div className="container flex flex-row justify-start">
            <div className="w-80 top-32">
              <Toc />
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
