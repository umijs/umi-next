import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import React from 'react';
import './global.less';
// @ts-ignore
import styles from './index.less';

export default function HomePage() {
  React.useEffect(() => {
    confetti();
  }, []);
  return <div className={styles.title}>HomePage</div>;
}
