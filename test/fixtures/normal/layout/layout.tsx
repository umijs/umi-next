import React from 'react';
import { Link } from 'umi';

const Layout = (props) => {
  return (
    <div>
      <Link to="/" id="link-index">index</Link>
      <Link to="/bar" id="link-bar">bar</Link>
      {props.children}
    </div>
  );
};

export default Layout;
