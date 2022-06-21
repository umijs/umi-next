import { Outlet } from '@umijs/max';

const Layout = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>我是公共的layout</h1>
      <div>
        <Outlet />
      </div>
    </div>
  );
};
export default Layout;
