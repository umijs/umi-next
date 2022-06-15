import React from 'react';
// @ts-ignore
import { useServerLoaderData } from 'umi';

export default function HomePage() {
  const { message } = useServerLoaderData();
  return <div>Home Page {message}</div>;
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  console.log('load server loader from route[id=index]');
  return { message: 'data from server loader of index.tsx' };
}
