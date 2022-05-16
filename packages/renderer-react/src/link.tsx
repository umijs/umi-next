import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from './appContext';

export default function (props: PropsWithChildren<{ to: string }>) {
  const appData = useAppData();
  return (
    <Link onMouseEnter={() => appData.preloadRoute(props.to)} to={props.to}>
      {props.children}
    </Link>
  );
}
