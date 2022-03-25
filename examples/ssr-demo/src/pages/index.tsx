import React from 'react';
import { Link, useLoaderData } from 'umi';

export default function HomePage() {
  const d = useLoaderData();
  return (
    <div>
      <h1>Hello~</h1>
      <p>This is index.tsx</p>
      <Link to="/users/user">/users/user</Link>
      <p>loader data: {JSON.stringify(d)}</p>
    </div>
  );
}

export async function loader() {
  return { message: 'data from server loader of index.tsx' };
}

export async function clientLoader() {
  return { message: 'data from client loader of index.tsx' };
}
