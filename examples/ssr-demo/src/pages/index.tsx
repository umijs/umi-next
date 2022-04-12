import React from 'react';
import { Link, useClientLoaderData, useLoaderData } from 'umi';
import Button from '../components/Button';
// @ts-ignore
import bigImage from './big_image.jpg';
// @ts-ignore
import cssStyle from './index.css';
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
      <p className={cssStyle.title}>I should be pink</p>
      <p className={cssStyle.blue}>I should be cyan</p>
      <SVGSmile />
      <Button />
      <img src={bigImage} alt="" />
      <img src={umiLogo} alt="umi" />
      <Link to="/users/user">/users/user</Link>
      <p>loader data: {JSON.stringify(loaderData)}</p>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
}

export async function loader() {
  return { message: 'data from server loader of index~' };
}

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of index.tsx' };
}
