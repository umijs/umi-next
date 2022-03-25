import React from 'react';
import { Link, Outlet, useLoaderData } from 'umi';

export default () => {
  const d = useLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>Users layout</h1>
      <p>loader data: {JSON.stringify(d)}</p>
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
