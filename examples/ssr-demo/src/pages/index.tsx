import React from 'react';
import { Link, useClientLoaderData, useLoaderData } from 'umi';
import Button from '../components/Button';
import connect from '../database/connect';
import './index.less';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import SmileUrl, { ReactComponent as SVGSmile } from './smile.svg';
// @ts-ignore
import umiLogo from './umi.png';

export default function HomePage() {
  const loaderData = useLoaderData();
  const clientLoaderData = useClientLoaderData();
  return (
    <div>
      <h1 className="title">Hello~</h1>
      <p className={styles.blue}>This is index.tsx</p>
      <img src={SmileUrl} alt="smile" />
      <SVGSmile />
      <Button />
      <img src={umiLogo} alt="umi" />
      <Link to="/users/user">/users/user</Link>
      <p>loader data: {JSON.stringify(loaderData)}</p>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
}

export async function loader() {
  connect();
  return { message: 'data from server loader of index.tsx' };
}

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of index.tsx' };
}
