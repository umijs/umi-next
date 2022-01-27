import cx from 'classnames';
import React, { useEffect, useState } from 'react';
import HeroBackground from '../icons/hero-bg.svg';

interface HeroProps {
  title?: string | string[];
  description?: string;
  buttons?: {
    label: string;
    href: string;
  }[];
}

function Hero(props: HeroProps) {
  return (
    <div
      className="w-full h-[calc(100vh-60px)] bg-[rgb(16,37,62)] flex
              flex-row items-center justify-center overflow-hidden"
    >
      <img
        src={HeroBackground}
        className="w-full h-full absolute top-0 left-0
           z-10 object-cover blur-xl"
        alt=""
      />

      <div className="w-1/2 z-20">
        <div className="flex flex-col items-center">
          {typeof props.title === 'string' && (
            <h1 className="text-white text-7xl font-extrabold">
              {props.title}
            </h1>
          )}

          {props.title instanceof Array &&
            props.title.map((t, i) => (
              <h1 className="text-white text-7xl font-extrabold" key={i}>
                {t}
              </h1>
            ))}

          {!props.title && <DefaultTitle />}

          <p className="text-white text-center my-12 opacity-70 text-lg">
            {props.description}
          </p>

          <div className="flex flex-row">
            {props.buttons?.map((button, i) => (
              <button
                onClick={() => (window.location.href = button.href)}
                key={i}
                className="text-white text-lg bg-blue-600 py-2 min-w-36 mx-4 px-4 rounded-xl shadow-xl
            shadow-blue-900 hover:shadow-blue-700 transition-all"
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultTitle() {
  const [isPlugged, setPlugged] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPlugged(true);
    }, 100);
  }, []);

  return (
    <>
      <div className="flex flex-row mb-4">
        <h1 className="text-white text-7xl font-extrabold">一款</h1>
        <h1
          className={cx(
            'text-blue-300 text-7xl font-extrabold mx-1',
            'transition-all duration-700 delay-100',
            !isPlugged && 'translate-y-[-5rem]',
          )}
        >
          插件化
        </h1>
        <h1 className="text-white text-7xl font-extrabold">的</h1>
      </div>
      <h1 className="text-white text-7xl font-extrabold">企业级前端应用框架</h1>
    </>
  );
}

export default Hero;
