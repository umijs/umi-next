import React from 'react';

export default function HomePage() {
  return <div>Home Page</div>;
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of index.tsx' };
}
