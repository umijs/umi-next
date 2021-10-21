import React, { useState } from 'react';
import ReactDOM from 'react-dom';

function App() {
  const [count, setCount] = useState(0);

  return <div onClick={() => setCount(count + 1)}>Ap1p{count}</div>;
}

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
