import { PropsWithChildren } from 'react';

export default ({ children }: PropsWithChildren<void>) => {
  console.log('Red Wrapper render at', Date.now());
  return (
    <div
      style={{
        margin: 20,
        border: '10px solid red',
      }}
    >
      <h1>wrapper Red</h1>
      {children}
    </div>
  );
};
