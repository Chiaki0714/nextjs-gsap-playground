// app/experiments/flow-vertical-steps/steps.tsx
import type { ReactNode } from 'react';
import styles from './page.module.css';

export type Step = {
  title: string;
  body: ReactNode;
};

export const STEPS: Step[] = [
  {
    title: 'お問い合わせ',
    body: (
      <>
        <p className={styles.stepBody}>
          まずはお気軽にご連絡ください。要件が固まっていなくても大丈夫です。
        </p>
        <p className={styles.stepBody}>
          事前に内容を整理し、最適な進め方をご提案します。
        </p>
      </>
    ),
  },
  {
    title: 'ヒアリング',
    body: (
      <>
        <p className={styles.stepBody}>
          オンライン打ち合わせ（Google Meet等）で、目的・ターゲット・課題を確認します。
        </p>
        <ul className={styles.stepListBullets}>
          <li>伝えたいこと／届けたい相手</li>
          <li>現状の課題（既存サイトがある場合）</li>
          <li>参考サイト・イメージ共有</li>
        </ul>
      </>
    ),
  },
  {
    title: '分析と方向性の設計',
    body: (
      <>
        <p className={styles.stepBody}>
          競合やトレンドを調査し、訴求ポイントと構成を整理します。
        </p>
        <p className={styles.stepBody}>
          全体方針を「設計指針」として1枚にまとめ、プロジェクトの軸を明確にします。
        </p>
        <p className={styles.note}>お客様確認：設計指針 完成時</p>
      </>
    ),
  },
  {
    title: 'デザイン設計',
    body: (
      <>
        <p className={styles.stepBody}>
          ムードボードでトーンを揃え、スタイルガイドでデザインルール（文字・余白・色）を定義します。
        </p>
        <p className={styles.stepBody}>
          ワイヤーフレーム → ビジュアルデザインの順に進め、完成イメージを具体化します。
        </p>
        <p className={styles.note}>
          お客様確認：ワイヤー／TOP／全ページデザイン
        </p>
      </>
    ),
  },
  {
    title: '実装',
    body: (
      <>
        <p className={styles.stepBody}>
          デザインをもとに、実際に動くWebサイトへ構築します。
        </p>
        <ul className={styles.stepListBullets}>
          <li>スマホ対応（レスポンシブ）</li>
          <li>表示速度・安定性の最適化</li>
          <li>必要に応じてCMS導入（お知らせ／ブログ等）</li>
        </ul>
        <p className={styles.note}>
          お客様確認：テスト環境（または本番URL）
        </p>
      </>
    ),
  },
  {
    title: '最終確認・納品',
    body: (
      <>
        <p className={styles.stepBody}>
          最終チェック後、そのまま公開・納品となります。
        </p>
        <p className={styles.stepBody}>
          CMS導入時は更新方法もレクチャーします。納品後の軽微なご質問も可能な範囲で対応します。
        </p>
      </>
    ),
  },
];
