import React from 'react';

export default function TestInitialPropsParent({
  foo,
  children,
}: {
  foo: string;
  children: any;
}) {
  return (
    <>
      <h1>{foo}</h1>
      {children}
    </>
  );
}

TestInitialPropsParent.getInitialProps = async () => {
  return new Promise(resolve => {
    resolve({
      foo: 'parent',
    });
  });
};
