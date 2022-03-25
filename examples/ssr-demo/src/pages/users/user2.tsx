import React from 'react';
import { useClientLoaderData, useLoaderData } from 'umi';

export default () => {
  const loaderData = useLoaderData();
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>User2 data</h1>
      <p>loader data: {JSON.stringify(loaderData)}</p>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
};

export async function loader() {
  return { message: 'data from server loader of users/user2.tsx' };
}

export async function clientLoader() {
  return { message: 'data from client loader of users/user2.tsx' };
}
