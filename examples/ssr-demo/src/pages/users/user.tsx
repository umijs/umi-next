import React from 'react';
import { useClientLoaderData, useLoaderData } from 'umi';

export default () => {
  const loaderData = useLoaderData();
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>User data</h1>
      <p>loader data: {JSON.stringify(loaderData)}</p>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
};

export async function loader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of users/user.tsx' };
}

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users/user.tsx' };
}
