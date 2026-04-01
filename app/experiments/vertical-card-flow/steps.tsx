import type { ReactNode } from 'react';

import styles from './page.module.css';

export type Step = {
  id: string;
  title: string;
  body: ReactNode;
};

type StepParagraphProps = {
  children: ReactNode;
};

function StepParagraph({ children }: StepParagraphProps) {
  return <p className={styles.stepBody}>{children}</p>;
}

type StepListProps = {
  items: string[];
};

function StepList({ items }: StepListProps) {
  return (
    <ul className={styles.stepListBullets}>
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

type StepNoteProps = {
  children: ReactNode;
};

function StepNote({ children }: StepNoteProps) {
  return <p className={styles.note}>{children}</p>;
}

export const STEPS: Step[] = [
  {
    id: 'contact',
    title: 'お問い合わせ',
    body: (
      <>
        <StepParagraph>
          まずはお気軽にご連絡ください。要件が固まっていなくても大丈夫です。
        </StepParagraph>
        <StepParagraph>
          事前に内容を整理し、最適な進め方をご提案します。
        </StepParagraph>
      </>
    ),
  },
  {
    id: 'hearing',
    title: 'ヒアリング',
    body: (
      <>
        <StepParagraph>
          オンライン打ち合わせ（Google
          Meet等）で、目的・ターゲット・課題を確認します。
        </StepParagraph>
        <StepList
          items={[
            '伝えたいこと／届けたい相手',
            '現状の課題（既存サイトがある場合）',
            '参考サイト・イメージ共有',
          ]}
        />
      </>
    ),
  },
  {
    id: 'direction',
    title: '分析と方向性の設計',
    body: (
      <>
        <StepParagraph>
          競合やトレンドを調査し、訴求ポイントと構成を整理します。
        </StepParagraph>
        <StepParagraph>
          全体方針を「設計指針」として1枚にまとめ、プロジェクトの軸を明確にします。
        </StepParagraph>
        <StepNote>お客様確認：設計指針 完成時</StepNote>
      </>
    ),
  },
  {
    id: 'design',
    title: 'デザイン設計',
    body: (
      <>
        <StepParagraph>
          ムードボードでトーンを揃え、スタイルガイドでデザインルール（文字・余白・色）を定義します。
        </StepParagraph>
        <StepParagraph>
          ワイヤーフレーム →
          ビジュアルデザインの順に進め、完成イメージを具体化します。
        </StepParagraph>
        <StepNote>お客様確認：ワイヤー／TOP／全ページデザイン</StepNote>
      </>
    ),
  },
  {
    id: 'build',
    title: '実装',
    body: (
      <>
        <StepParagraph>
          デザインをもとに、実際に動くWebサイトへ構築します。
        </StepParagraph>
        <StepList
          items={[
            'スマホ対応（レスポンシブ）',
            '表示速度・安定性の最適化',
            '必要に応じてCMS導入（お知らせ／ブログ等）',
          ]}
        />
        <StepNote>お客様確認：テスト環境（または本番URL）</StepNote>
      </>
    ),
  },
  {
    id: 'delivery',
    title: '最終確認・納品',
    body: (
      <>
        <StepParagraph>
          最終チェック後、そのまま公開・納品となります。
        </StepParagraph>
        <StepParagraph>
          CMS導入時は更新方法もレクチャーします。納品後の軽微なご質問も可能な範囲で対応します。
        </StepParagraph>
      </>
    ),
  },
];
