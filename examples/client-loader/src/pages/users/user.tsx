import React from 'react';
import { useClientLoaderData } from 'umi';
// @ts-ignore
import bigImage from './big_image.jpg';

export default () => {
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>User data</h1>
      <img src={bigImage} alt="big image" />
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
};

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users/user.tsx' };
}
