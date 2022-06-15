import React from 'react';
// @ts-ignore
import { useServerLoaderData } from 'umi';
// @ts-ignore
import bigImage from '../assets/big_image.jpg';
// @ts-ignore
import fooStyles from './foo.less';
// @ts-ignore
import barStyles from './bar.less';

export default function HomePage() {
  const { message } = useServerLoaderData();
  return (
    <div>
      <div className={`${fooStyles.foo} ${barStyles.bar}`}>
        Home Page {message}
      </div>
      <img src={bigImage} alt="" />
    </div>
  );
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  console.log('load server loader from route[id=index]');
  return { message: 'data from server loader of index.tsx' };
}
