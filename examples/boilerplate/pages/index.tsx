import React from 'react';
// @ts-ignore
import SvgSmile from '../smile.svg';
// @ts-ignore
import Smileurl from '../smile.svg?url';
import './global.less';
// @ts-ignore
import styles from './index.less';

export default function HomePage() {
  return (
    <div className={styles.title}>
      HomePage
      <div className={styles.smile}></div>
      <img src={Smileurl} alt="" />
      <SvgSmile />
    </div>
  );
}
