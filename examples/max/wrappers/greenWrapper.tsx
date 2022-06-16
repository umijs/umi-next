import { PropsWithChildren } from 'react';

export default ({ children }: PropsWithChildren<void>) => {
  console.log('Green Wrapper render at', Date.now());

  return (
    <div style={{ margin: 20, border: '10px solid green' }}>
      <h1>wrapper Green</h1>
      <div>{children}</div>
    </div>
  );
};
