import React from 'react';
import { Link, Outlet, useClientLoaderData } from 'umi';
import bigTask from '../../services/bigTask';

export default () => {
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <Link to="/">Go back</Link>
      <h1>Users layout</h1>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <Link to="/users/user" style={{ marginRight: 8 }}>
        /users/user
      </Link>
      <Link to="/users/user2">/users/user2</Link>
      <Outlet />
    </div>
  );
};

export async function clientLoader() {
  await bigTask();
  return { message: 'data from client loader of users.tsx' };
}
