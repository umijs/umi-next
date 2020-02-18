import React from 'react';
import { Link } from 'umi';
import styles from './index.less';

const { useState, useEffect } = React;

export default (props) => {
  console.log('props', props);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);
  return (
    <div className={styles.wrapper}>
      <p id="loaded">{String(loaded)}</p>
      <p id="define">{UMI_DEFINE}</p>
    </div>
  )
}
