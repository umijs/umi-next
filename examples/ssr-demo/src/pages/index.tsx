import React from 'react';
import { Link, useClientLoaderData, useLoaderData } from 'umi';

export default function HomePage() {
  const loaderData = useLoaderData();
  const clientLoaderData = useClientLoaderData();
  return (
    <div>
      <h1>Hello~</h1>
      <p>This is index.tsx</p>
      <Link to="/users/user">/users/user</Link>
      <p>loader data: {JSON.stringify(loaderData)}</p>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
}

export async function loader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of index.tsx' };
}

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of index.tsx' };
}
