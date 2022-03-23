import React from 'react';
import { Outlet } from 'umi';

export default () => {
  return (
    <div>
      <h2>users layout</h2>
      <Outlet />
    </div>
  );
};
