import React from 'react';
// @ts-ignore
import { history } from 'umi';
export default function HomePage() {
  return (
    <div>
      <h2>index page</h2>
      <button onClick={() => history.push('/models')}>go to '/models'</button>
    </div>
  );
}
