import React from 'react';

export default function TestInitialProps({ foo }: { foo: string }) {
  return <h2>{foo}</h2>;
}

TestInitialProps.getInitialProps = async () => {
  return {
    foo: 'bar',
  };
};
