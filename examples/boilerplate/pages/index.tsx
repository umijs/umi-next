import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import React from 'react';
// @ts-ignore
import Smileurl, { ReactComponent as SvgSmile } from '../smile.svg';
import './global.less';
// @ts-ignore
import styles from './index.less';

export default function HomePage() {
  React.useEffect(() => {
    confetti();
  }, []);
  return (
    <div className={styles.title}>
      HomePage
      <div className={styles.smile}></div>
      <img src={Smileurl} alt="" />
      <SvgSmile />
    </div>
  );
}
