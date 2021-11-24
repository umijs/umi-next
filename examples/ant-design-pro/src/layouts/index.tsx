import React from 'react';
import { Outlet } from 'umi';

export default function () {
  return (
    <div>
      <h1>layout</h1>
      <Outlet />
    </div>
  );
}
