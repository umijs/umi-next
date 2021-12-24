import { Button, Slider } from 'antd-mobile';
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div>
      <Button type="button" color="primary" fill="solid" block size="large">
        注意看这个按钮的大小，要强制刷新浏览器才能更新
      </Button>
      <Slider />
    </div>
  );
};

export default HomePage;
