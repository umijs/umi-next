import React from 'react';
import TextLoop from 'react-text-loop';
// @ts-ignore
import { Link } from 'umi';
// @ts-ignore
import styles from './Hero.css';

export default () => {
  // TODO: github stars 存 localStorage
  //  采用 stale-while-revalidate 的策略
  return (
    <div className={styles.normal}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.bigLogo} />
          <div className={styles.actions}>
            <Link to="/docs/tutorials/getting-started">
              <div className={styles.button}>快速上手 →</div>
            </Link>
            <div className={styles.githubStar}>12K+ Github Stars</div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.bigSlogan1}></div>
          <div className={styles.bigSlogan2}></div>
          <div className={styles.slogan}>
            用 Umi 构建你的下一个{' '}
            <strong>
              <TextLoop>
                <span>React</span>
                <span>Vue</span>
              </TextLoop>
            </strong>{' '}
            应用
          </div>
          <div className={styles.slogan}>
            带给你<strong>简单</strong>而<strong>愉悦</strong>的 Web 开发体验
          </div>
          <div className={styles.bow} />
        </div>
      </div>
    </div>
  );
};
