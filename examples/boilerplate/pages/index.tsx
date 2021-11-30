import lodash from 'https://cdn.skypack.dev/lodash';
import React from 'react';
import './global.less';
// @ts-ignore
import styles from './index.less';

export default function HomePage() {
  console.log(lodash);
  return <div className={styles.title}>HomePage</div>;
}
