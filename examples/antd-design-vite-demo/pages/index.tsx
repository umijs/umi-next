import { Button } from 'antd';
import 'antd/dist/antd.css';
import React from 'react';
import './index.less';

export default function HomePage() {
  return (
    <div>
      <Button type="primary">测试按钮</Button>
      <div className="title">标题</div>
    </div>
  );
}
