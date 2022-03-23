import React, { useEffect } from 'react';
import { Link } from 'umi';

export default function HomePage() {
  useEffect(() => {
    alert('useEffect');
  }, []);

  return (
    <div>
      <h1>Hello~</h1>
      <p>This is index.tsx</p>
      <Link to="/users/foo">/users/foo</Link>
    </div>
  );
}
