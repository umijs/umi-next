import React from 'react';
import { useClientLoaderData } from 'umi';
import Button from '../../components/Button';

export default () => {
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>User2 data</h1>
      <Button />
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
};

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users/user2.tsx' };
}
