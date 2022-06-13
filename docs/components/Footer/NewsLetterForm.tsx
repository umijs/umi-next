import React from 'react';
// @ts-ignore
import styles from './NewsLetterForm.css';

export default () => {
  return (
    <div className={styles.normal}>
      <h2>订阅 Umi 的最新动态</h2>
      <form action="">
        <input type="text" placeholder="请输入电子邮箱地址" />
        <button type="submit">订阅</button>
      </form>
    </div>
  );
};
