import React from 'react';
import { Tutorial } from 'shared';

export default function HomePage() {
  return (
    <div>
      <h2>Yay! Welcome to umi!</h2>
      <p>
        To get started, edit <code>pages/index.tsx</code> and save to reload.
      </p>
      <p>
        <Tutorial />
      </p>
    </div>
  );
}
