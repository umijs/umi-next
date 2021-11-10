import 'antd/dist/antd.less';
import Button from 'antd/es/button';
import Input from 'antd/es/input';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div onClick={() => setCount(count + 1)}>
      App{count}
      <Button type="primary">Button</Button>
      <Input />
    </div>
  );
}

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
