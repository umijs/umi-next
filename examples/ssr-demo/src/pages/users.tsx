import React from 'react';
import { Link, Outlet, useClientLoaderData, useLoaderData } from 'umi';

export default () => {
  const loaderData = useLoaderData();
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <Link to="/">Go back</Link>
      <h1>Users layout</h1>
      <p>loader data: {JSON.stringify(loaderData)}</p>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <Link to="/users/user" style={{ marginRight: 8 }}>
        /users/user
      </Link>
      <Link to="/users/user2">/users/user2</Link>
      <Outlet />
    </div>
  );
};

export async function loader() {
  return { message: 'data from server loader of users.tsx' };
}

export async function clientLoader() {
  return { message: 'data from client loader of users.tsx' };
}
