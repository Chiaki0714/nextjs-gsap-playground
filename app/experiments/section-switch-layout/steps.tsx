import type { ReactNode } from 'react';
import styles from './page.module.css';

export type Step = {
  title: string;
  body: ReactNode;
};

export const STEPS: Step[] = [
  {
    title: 'Introduction',
    body: (
      <>
        <p className={styles.stepBody}>
          静と動の設計。
          <br />
          ここは<strong className={styles.em}>強調</strong>もできる。
        </p>
      </>
    ),
  },
  {
    title: 'Philosophy',
    body: (
      <>
        <p className={styles.stepBody}>
          スクロールに意味を持たせる。
          <br />
          行を増やしたり、<span className={styles.muted}>色を薄く</span>
          もできる。
        </p>
      </>
    ),
  },
  {
    title: 'Craft',
    body: (
      <>
        <p className={styles.stepBody}>細部まで設計されたUI。</p>
        <ul className={styles.stepListBullets}>
          <li>余白</li>
          <li>タイポ</li>
          <li>インタラクション</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Vision',
    body: (
      <>
        <p className={styles.stepBody}>
          余白と流れのデザイン。
          <br />
          文章を2段落にしたい時もこのまま。
        </p>
        <p className={styles.stepBody}>
          <a
            className={styles.link}
            href='#'
            target='_blank'
            rel='noopener noreferrer'
          >
            リンク表現も可能
          </a>
        </p>
      </>
    ),
  },
];
