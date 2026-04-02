# Chiaki Frontend Rulebook v8

## はじめに

このルールブックは、Next.js + GSAP Playground を安定して育てながら、将来の別案件にも転用しやすい実装基準をまとめたものです。  
目的は、書き方を増やすことではなく、**判断を減らすこと** にあります。

このルールブックでは、ルールを次の 3 層で整理します。

1. **Core Principles**  
   実装判断の土台になる普遍的な方針

2. **Shared Implementation Rules**  
   複数案件でも再利用しやすい設計・実装ルール

3. **Current Project Rules**  
   現在の Next.js + GSAP Playground 専用の運用ルール

---

# Part 1. Core Principles

## 1. このプロジェクトで最優先すること

実装で迷った場合は、次の優先順位で判断します。

1. UI が自然であること
2. 実機スマホで安定すること
3. 保守しやすいこと
4. 横展開しやすいこと
5. 演出として気持ちよいこと

---

## 2. 基本方針

- 世界標準で見ても実務的な構成を優先する
- シンプルで責務が明確な構造にする
- 書き方・命名・構造をできるだけ統一する
- 見た目ではなく役割で設計する
- PC と SP で無理に同じ実装にしない
- 演出より UI の安定を優先する
- 将来のテーマ対応や横展開に備える
- 一時的な思いつきではなく、再現可能な実装基準に寄せる

---

## 3. 実装判断の共通原則

### まず単純な構成で成立させる

- まずは最小構成で成立するかを考える
- 過剰な抽象化・共通化はしない
- 必要性が明確になってから切り出す

### 局所化する

- 状態は必要な場所に閉じ込める
- GSAP や DOM 制御は必要な範囲に閉じ込める
- page 全体を慣習的に client component にしない

### 責務を混ぜない

- レイアウト責務
- 見た目責務
- 動き責務
- データ責務

これらをできるだけ分離する。

---

# Part 2. Shared Implementation Rules

## 1. Next.js / React 方針

App Router を前提に、React Component は **Server Component を基本** とします。  
Client Component は必要な責務がある場合にのみ採用します。

### Server Component を基本にする対象

- 静的なレイアウト
- 単純な UI 出力
- props を受けて描画するだけの presentational component
- `Link` を返すだけのカードや一覧 item

### Client Component にする対象

- `useState`
- `useEffect`
- `useLayoutEffect`
- `useRef` を使った DOM 制御
- GSAP
- ブラウザ API
- イベントや UI 状態を持つコンポーネント

### ルール

- まず Server Component で成立するかを考える
- 必要な箇所だけ Client Component に切り出す
- ページ全体を慣習的に `use client` にしない
- GSAP を使う責務は可能な限り局所化する

---

## 2. HTML / レイアウト設計

### 基本骨格

ページ構造は、原則として `main > wrapper > container` を基本骨格にします。

```tsx
<main className={styles.main}>
  <section className={styles.wrapper}>
    <div className={styles.container}>...</div>
  </section>
</main>
```

### 役割

#### `main`

ページ全体の土台。  
背景色、ページ全体の文字色、最小高さなど、ページレベルの責務を持たせる。

#### `wrapper`

セクション単位のまとまり。  
主に縦余白とセクションの区切りを担当する。

#### `container`

中身の幅を制御する層。  
`max-width`、左右ガター、内部レイアウトを担当する。

#### `inner`

必要な場合のみ使う。  
慣習的には追加しない。

### セマンティクス

- HTML 要素とクラス名の意味を一致させる
- `nav`、`main`、`header`、`section` などの landmark を適切に使う
- 見出し階層はページ構造に沿って設計する

---

## 3. CSS / Styling 方針

### CSS Modules 命名ルール

クラス名は **camelCase** で統一します。

推奨例:

- `heroCopy`
- `textSection`
- `mediaColumn`
- `tagActive`
- `emptyDescription`

避ける例:

- `redText`
- `bigBox`
- `leftBox`

### 命名の考え方

- 色や見た目ではなく、役割で命名する
- 状態は状態として命名する
- 一時的な見た目差分をクラス名に埋め込まない

---

## 4. Global と Local の責務分離

### globals.css に置くもの

- design token
- reset / base
- 共通初期設定
- 本当に共通の layout utility

### module.css に置くもの

- ページ固有の見た目
- コンポーネント固有の見た目
- そのページで閉じるレイアウト制御

### 判断基準

- 複数ページで同じ振る舞いが必要なものは global
- そのページの責務として完結するものは local
- local で十分な責務は無理に global utility に寄せない
- global token は積極的に使い、global class への依存は必要最小限にする

### token / custom property 運用ルール

- global token で足りるなら、そのまま直接使う
- `--foo: var(--bar);` のような **1:1 の別名 token は作らない**
- local custom property は、構造寸法・計算用・同一ファイル内で複数参照する値に限定する
- 名前を変えるためだけの local token は作らない
- global token を local custom property に置き換えてコード量を増やさない
- local custom property を作るときは、「そのファイルでまとめて管理する意味があるか」で判断する

### local custom property を作ってよい例

- `calc()` の基準になる構造値
- left column width / indicator position / media ratio のようなページ固有の構造値
- 同一ファイル内で複数回参照する寸法や係数
- 一時調整値ではなく、そのコンポーネントの構造として意味がある値

### local custom property を作らない例

- `--card-padding-inline: var(--space-3xl);`
- `--flow-surface: var(--surface-1);`
- `--note-border: var(--border-2);`

これらのように、単に global token を別名にしているだけのものは作らず、最初から global token を直接使う。

---

## 5. Width / Container 設計

幅設計では、「背景や演出」と「読む・操作する中身」を分けて考えます。

### 基本ルール

- 背景や演出面はフル幅で考える
- テキストや UI には読みやすい上限幅を持たせる
- `max-width` は最外層ではなく `container` 側で制御する

### 共通 token

```css
:root {
  --container: 1280px;
  --container-wide: 1440px;
  --container-ultra: 1600px;
  --prose: 65ch;
  --gutter: clamp(16px, 3vw, 40px);
}
```

### 基本例

```css
.container {
  width: min(var(--container-wide), calc(100% - (var(--gutter) * 2)));
  margin-inline: auto;
}
```

---

## 6. Responsive 設計

### 原則

- **サイズは `clamp()`**
- **構造は `@media`**

### `clamp()` を使う対象

- `font-size`
- `padding`
- `margin`
- `gap`
- `border-radius`
- 一部の `min-height`

### `@media` を使う対象

- カラム数の変更
- `flex-direction` の切り替え
- `absolute` から `static` への変更
- `display: none` の制御
- 要素順の入れ替え
- pin の ON / OFF
- desktop 用 UI と mobile 用 UI の分岐

### clamp-first 方針

まず `clamp()` で設計し、構造が変わる場合だけ `@media` で制御する。

### Shared breakpoints

アプリ全体で使う breakpoint は以下に固定する。  
構造上どうしても必要な場合を除き、one-off の値は追加しない。

- `48rem` = `768px`
- `64rem` = `1024px`
- `75rem` = `1200px`
- `90rem` = `1440px`

### breakpoint 運用ルール

- media query は原則 `rem` で書く
- CSS の構造変更はこの shared breakpoint のみで行う
- 近い値の breakpoint を増やさず、既存値に集約する
- `640px`、`900px`、`959px`、`1000px` のような近接値は、原則 shared breakpoint に統一する

---

## 6.1 Desktop Motion Gating

### 目的

PC 向けのスクロール演出（pin / scrub / horizontal scroll / fullscreen reveal など）は、すべての端末で強制的に動かすのではなく、**操作環境とパフォーマンスに応じて制御する**。

これにより、

- タッチ端末での UX 崩壊を防ぐ
- 不要な負荷を避ける
- 実装の判断基準を統一する

### Rule 1: 構造と演出の責務を分ける

- レイアウト構造の切り替え → CSS breakpoint
- 動き（GSAP）の有効 / 無効 → JS 側で判定

### Rule 2: Desktop Motion の条件

PC 向けの GSAP 演出は、以下すべてを満たす場合のみ有効化する。

```ts
(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)
```

### Rule 3: Mobile / Tablet の扱い

以下の場合は desktop 演出を無効化する。

- `min-width: 64rem` 未満
- `pointer: coarse`
- `hover: none`
- `prefers-reduced-motion: reduce`

この場合は、

- pin を使わない
- scrub を使わない
- transform アニメーションを適用しない
- 静的レイアウトとして成立させる

### Rule 4: 判定ロジックの一元管理

各ページで media query をベタ書きせず、共通化する。

```ts
// app/lib/media-queries.ts

export const BREAKPOINTS = {
  md: '48rem',
  lg: '64rem',
  xl: '75rem',
  xxl: '90rem',
} as const;

export const MEDIA_QUERIES = {
  desktopMotion: `(min-width: ${BREAKPOINTS.lg}) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`,
} as const;
```

### Rule 5: GSAP 実装ルール

```ts
const mm = gsap.matchMedia();

mm.add(
  {
    desktopMotion: MEDIA_QUERIES.desktopMotion,
  },
  context => {
    const { desktopMotion } = context.conditions as {
      desktopMotion: boolean;
    };

    if (!desktopMotion) {
      // 静的状態にリセットして終了
      return;
    }

    // ここに desktop 専用の GSAP ロジックを書く
  },
);
```

### Rule 6: 禁止事項

- User-Agent 判定
- `ontouchstart` ベースの分岐
- width のみでの desktop 判定

理由：

- デバイス進化で破綻しやすい
- 保守コストが高い
- 実際の操作環境と一致しない

### 設計意図

- **breakpoint = 見た目の構造**
- **media capability = 操作体験**

この 2 つを分離することで、実装の可読性と再利用性を高める。

---

## 7. Spacing Token

余白トークンは **layout 系** と **space 系** に分けて管理します。

### `--layout-*`

ページやセクションのような大きい単位の余白に使う。

```css
--layout-xs: clamp(12px, 2vw, 20px);
--layout-sm: clamp(20px, 3vw, 32px);
--layout-md: clamp(32px, 4vw, 48px);
--layout-lg: clamp(48px, 6vw, 72px);
--layout-xl: clamp(64px, 8vw, 112px);
--layout-2xl: clamp(96px, 12vw, 160px);
```

### `--space-*`

コンポーネント内部や小さい UI 同士の間隔に使う。

```css
--space-2xs: 4px;
--space-xs: 8px;
--space-sm: 12px;
--space-md: 16px;
--space-lg: 20px;
--space-xl: 24px;
--space-2xl: 32px;
--space-3xl: 40px;
--space-4xl: 48px;
--space-5xl: 64px;
```

### 運用ルール

- `--layout-*` はページやセクション単位の余白に使う
- `--space-*` はカード、ボタン、ラベルなどコンポーネント内部に使う
- `--layout-*` をカード内部 padding に流用しない
- `--space-*` をページ全体の縦リズムに流用しない
- magic number は意図がある場合のみ使う
- 同じ値が複数箇所で繰り返される場合は token 化を検討する
- 既存 token に十分近い値なら、新しい token は増やさず既存値に寄せる
- 誤差レベルの差分のために token を細分化しない

### gap / margin ルール

- 同列要素の間隔は `gap`
- 単発要素の距離は `margin-top`
- `margin-bottom` は原則使わない

---

## 8. Typography Token

### Font size tokens

```css
--font-display-xl: clamp(40px, 6vw, 64px);
--font-display-lg: clamp(32px, 4.8vw, 48px);
--font-display-md: clamp(24px, 3.2vw, 32px);
--font-display-sm: clamp(20px, 2.4vw, 24px);

--font-heading-lg: clamp(16px, 2vw, 20px);
--font-heading-md: clamp(14px, 1.6vw, 16px);

--font-body-lg: clamp(14px, 1.4vw, 16px);
--font-body-md: clamp(12px, 1.2vw, 14px);
--font-body-sm: clamp(11px, 1vw, 12px);

--font-label: clamp(11px, 1vw, 12px);
--font-tag: 11px;
--font-decor-md: clamp(12px, 1.2vw, 14px);
--font-decor-sm: clamp(11px, 1vw, 12px);
```

### Primitive tokens

```css
--leading-tight: 1.2;
--leading-snug: 1.35;
--leading-normal: 1.6;
--leading-relaxed: 1.8;

--tracking-tight: -0.02em;
--tracking-base: 0;
--tracking-sm: 0.02em;
--tracking-wide: 0.06em;
--tracking-wider: 0.12em;

--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
```

---

## 9. Primitive / Semantic Token

### Primitive token

```css
--radius-sm: 10px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-pill: 999px;

--duration-ui: 0.24s;
--duration-emphasis: 0.55s;

--blur-frosted: 10px;
```

### Semantic token

```css
--control-fg: #111111;
--control-border: rgba(17, 17, 17, 0.14);
--control-bg: rgba(255, 255, 255, 0.78);
--control-bg-hover: rgba(255, 255, 255, 0.9);

--panel-border-soft: rgba(0, 0, 0, 0.08);
--panel-bg-soft: rgba(0, 0, 0, 0.03);

--ui-line-soft: rgba(0, 0, 0, 0.16);
--ui-line-strong: rgba(0, 0, 0, 0.32);
--ui-dot-soft: rgba(0, 0, 0, 0.22);
--ui-dot-strong: rgba(0, 0, 0, 0.9);
```

### 運用ルール

- primitive token は radius / motion / blur などの基本値に使う
- semantic token は UI の役割単位で使う
- component 専用の offset / hover shift / 一時調整値は local custom property で持つ
- 近すぎる値のために token を分割しない
- 再利用性が弱い値は global token に上げない

---

## 10. Color / Theme 設計

### 基本方針

- カラーはすべて CSS 変数で管理する
- テーマ切り替えは `globals.css` の token 切り替えで制御する
- コンポーネント側で light / dark 分岐を書かない
- `prefers-color-scheme` を使って global token を切り替える
- 将来的に手動切り替えを追加する場合は `data-theme` で拡張する
- ページ専用カラーは必要最小限にとどめ、まずは global color token で組み立てる
- before / after など隣接セクションとの背景差が必要な場合でも、可能なら `surface` 系 token を優先して使う

### Light

```css
--background: #fcfcfc;
--foreground: #111111;

--surface-1: #f5f5f5;
--surface-2: #ebebeb;

--border-1: #e5e5e5;
--border-2: #d4d4d4;
--border-3: #b8b8b8;

--text-muted: rgba(0, 0, 0, 0.72);
--text-dim: rgba(0, 0, 0, 0.56);
--text-strong: rgba(0, 0, 0, 0.92);
```

### Dark

```css
--background: #0f0f0f;
--foreground: #ededed;

--surface-1: #151515;
--surface-2: #1b1b1b;

--border-1: #222222;
--border-2: #333333;
--border-3: #444444;

--text-muted: rgba(255, 255, 255, 0.75);
--text-dim: rgba(255, 255, 255, 0.6);
--text-strong: rgba(255, 255, 255, 0.92);
```

### 禁止事項

- `#fff` や `#000` のようなベタ書きで UI を組まない
- コンポーネントごとにテーマ分岐を持たせない
- global color token で十分表現できるのに、ページ専用 color token を増やさない

---

## 11. Font 運用

フォントは `next/font` を基本とします。

- 英数字: `Inter`
- 日本語: `Noto Sans JP`

理由は、自動最適化、CLS の抑制、実務上の汎用性の高さによる。

---

## 12. Accessibility / Interaction

### 基本方針

- 見た目だけで状態を伝えない
- semantic にも状態を伝える
- `button` の active 状態は必要に応じて `aria-pressed` を使う
- `aria-label` は本当に必要な場合のみ使う
- 既存テキストで十分伝わる場合は不要な上書きをしない
- focus 表示は消さず、`focus-visible` を基準に扱う

### hover / pointer ルール

- hover スタイルは `@media (hover: hover) and (pointer: fine)` の中でのみ書く
- touch 端末では hover を前提にしない
- touch 端末のフィードバックは `:active` を使う
- 選択状態や開閉状態は hover ではなく、React state / `data-state` / ARIA 属性で管理する
- `focus-visible` は hover と切り離して常に配慮する

### touch feedback の補助ルール

- `:active` は「押している瞬間の補助フィードバック」として扱う
- 見た目変化が知覚しづらい場合は、無理に scale を入れず border / background の変化だけでもよい
- 誤差レベルの scale 値違いのために token を増やさない

---

## 13. Viewport / Motion / Performance

### viewport 高さ

モバイル環境では `vh` 単独を前提にしない。

```css
min-height: 100vh;
min-height: 100svh;
min-height: 100dvh;
```

- 優先は `dvh`
- fallback として `vh` / `svh` を残す
- full-height section は、その section 自身に高さを持たせる

### reduced motion

`prefers-reduced-motion: reduce` には対応する。  
アニメーションや transition は極端に短縮し、不要な動きを避ける。

### パフォーマンス判断基準

- 軽い `filter` や単純な値計算のために慣習的に `useMemo` を使わない
- 本当に再計算コストが高い場合のみ `useMemo` を検討する
- `will-change` は常時指定しない
- transform / opacity アニメーションなど、効果が明確な対象に限定する

---

# Part 3. Current Project Rules

## 1. プロジェクト概要

現在進めているのは **Next.js + GSAP Playground** です。  
GSAP の実験ページを増やしながら、後から見返しても分かりやすく、保守しやすく、必要に応じてポートフォリオにも転用できる構成を保つことを目的とします。

このプロジェクトは単なる学習用サンプル置き場ではなく、今後の自分の実装基準を整理し、実案件へ横展開するための基準プロジェクトとして扱います。

---

## 2. ディレクトリ運用

### app 配下

公開中、または Home に載せる実験だけを `app/experiments` に置く。

```txt
app/
  experiments/
    horizontal-scroll/
    section-switch-layout/
    vertical-card-flow/
    parallax-layout/
```

### archive 配下

今は使わないが残しておきたいもの、没案、試作段階のものは `archive` に移す。

```txt
archive/
  experiments/
    old-scrub-layout/
    trial-01/
```

### 基本ルール

- `app` の中 = 現在見せるもの
- `archive` の中 = 保管用
- 完全に不要になったものは削除し、必要に応じて Git 履歴で追う

---

## 3. 命名ルール

### フォルダ名 / href

フォルダ名や URL は、内容ではなく **構造と挙動** で命名する。

推奨例:

- `horizontal-scroll`
- `section-switch-layout`
- `vertical-card-flow`
- `parallax-layout`

### タイトル

Home で認識しやすいよう、タイトルも内容依存を避ける。

推奨例:

- `Horizontal Scroll`
- `Section Switch Layout`
- `Vertical Card Flow`
- `Parallax Layout`

### 説明文

説明文は「何の内容か」ではなく、「どういう構造と動きか」を記述する。

推奨例:

- `Pinned horizontal layout with scrubbed panel translation`
- `Pinned content layout with state-based section switching and progress indicator`
- `Pinned card layout with vertical progress sync and scrubbed inner flow`
- `Full-bleed, split, and inset media layouts with scrubbed image parallax`

---

## 4. Registry / Data 配置

### experiments registry

Home 用メタデータは `app/experiments/_registry/experiments.ts` に集約する。

ここに置くもの:

- `title`
- `description`
- `href`
- `tags`

ここに置かないもの:

- 実験ページ固有の JSX
- 各ページ固有の step データ本文
- 長いロジック

### ページ専用データ

そのページ専用のデータは、そのページのフォルダに同居させる。

```txt
app/experiments/section-switch-layout/
  page.tsx
  page.module.css
  steps.tsx
```

### ルール

- 専用のものは同じフォルダ
- 共有するものだけ共通化する
- 画像だけを切り出す場合は `images.ts`
- セクション全体データなら `sections.ts`

---

## 5. experiments ページの基本構造

experiments の子ページでは、最外層を `section.wrapper` に統一する。

```tsx
<section ref={rootRef} className={styles.wrapper}>
  ...
</section>
```

Home や layout 側の主要領域には `main` を使って構わない。  
ただし、experiments 子ページでは書き方を揃える。

---

## 6. GSAP / ScrollTrigger 実装方針

### GSAP は `useGSAP` に統一する

GSAP 実装は原則 `useGSAP` を使う。  
cleanup を統一しやすく、`scope` によって DOM 探索範囲を限定しやすいため。

### DOM 取得は root 配下に限定する

避ける書き方:

```ts
document.querySelector(...)
```

推奨する書き方:

```ts
const root = rootRef.current;
root?.querySelector(...);
gsap.utils.toArray(selector, root);
gsap.utils.selector(root);
```

### cleanup

GSAP / ScrollTrigger / ticker / listener は、`useGSAP` または effect の `return` で必ず cleanup する。

### ScrollTrigger の使い分け

#### `gsap.to` / `gsap.fromTo`

アニメーション自体が主役のときに使う。

用途:

- parallax
- fade
- 単体要素の reveal

#### `ScrollTrigger.create`

監視や状態管理が主役のときに使う。

用途:

- pin
- progress 監視
- dataset 更新
- state switch

#### `timeline + scrollTrigger`

複数演出を一本の流れで管理したいときに使う。

用途:

- 横スクロール
- 連続演出
- 一連のモーション制御

### Desktop Motion Gating の適用

pin / scrub / fullscreen reveal / horizontal translation のような PC 専用演出は、`Desktop Motion Gating` の条件に従って ON / OFF を判定する。

- CSS は shared breakpoint で構造を切り替える
- JS は `MEDIA_QUERIES.desktopMotion` で desktop 専用演出を有効化する
- mobile / tablet では静的レイアウトとして成立させる

### 実装整理ルール

- hook 化は必要性が明確になるまで行わない
- まずは同一ファイル内で小関数に分けて責務を整理する
- 定数は意味のある名前でファイル上部に置く
- 描画・進捗計算・active state 更新・end 計算を読み分けられる構造にする

---

## 7. Lenis / Scroll 管理

### Lenis は Provider で一元管理する

`LenisProvider` に次を集約する。

- Lenis 初期化 / destroy
- GSAP ticker 連携
- `ScrollTrigger.update` 連携
- route change 時の scroll reset
- `ScrollTrigger.config(...)`
- 端末特性に応じた Lenis ON / OFF 判定

### グローバル設定はページごとに書かない

例:

- `ScrollTrigger.config({ ignoreMobileResize: true })`

こうした設定は Provider 側でまとめて管理する。

### Lenis の ON / OFF 方針

- `prefers-reduced-motion: reduce` → OFF
- `pointer: coarse` かつ `hover: none` → OFF
- それ以外の desktop / laptop 環境 → ON

### scroll restoration 方針

- 同一ページのリロード時はブラウザ標準を尊重する
- App Router 内のページ遷移時は先頭へ reset する
- reset 後に `ScrollTrigger.refresh()` を行い、計測を整える

### route change 時の reset

- `lenis.scrollTo(0, { immediate: true })`
- `window.scrollTo(0, 0)`
- `document.documentElement.scrollTop = 0`
- `document.body.scrollTop = 0`
- `ScrollTrigger.clearScrollMemory?.()`
- 必要に応じて `requestAnimationFrame` 後に `ScrollTrigger.refresh()`

### Lenis と Desktop Motion の整合

Lenis の ON / OFF も、原則として Desktop Motion Gating と矛盾しない条件で運用する。  
PC 専用の重いスクロール演出を使わない環境では、native scroll を優先する。

---

## 8. Parallax 実装ルール

parallax では trigger と target を分けて考える。

- trigger = `.media`
- target = `.mediaImage`

動きの強さは `data-depth` で管理する。

- `1.0` = 標準
- `1 未満` = 弱め
- `1 より大きい` = 強め

Desktop Motion Gating に該当しない環境では、parallax の transform をリセットし、静的表示に戻す。

---

## 9. Home ページ運用

Home は実験ページの一覧 UI として扱う。  
そのため、ScrollTrigger による重い演出よりも、一覧としての軽さ、可読性、絞り込みやすさを優先する。

### Home で優先すること

- 一覧性
- 可読性
- 絞り込みやすさ
- 軽さ
- 実験追加のしやすさ

### アニメーション方針

Home のカード一覧では、基本的に `ScrollTrigger.batch()` を使わない。  
初回表示やフィルタ切り替えは、`gsap.set` + `gsap.to` のみで軽く見せる。

### 現時点の基準

- `autoAlpha: 0 -> 1`
- `y: 18 -> 0`
- `duration: 0.65`
- `stagger: 0.06`
- `ease: 'power2.out'`

### reduced motion

`prefers-reduced-motion: reduce` の端末では一覧アニメーションを即表示に切り替える。

### 幅とグリッド

Home の幅は **page.module.css 側の `.container` で完結** させる。  
最大幅の基準には global token の `--container-wide` を使う。

カードグリッド基準:

- SP: 1 列
- `48rem` 以上: 2 列
- `64rem` 以上: 3 列

### Empty State

タグに紐づく項目が 0 件のときは、カード風に強く見せない。  
border や background を強く付けず、補足テキストとして控えめに見せる。  
横幅は `56ch` 前後に抑える。

### 実装補足

- `EXPERIMENTS.filter(...)` 程度の軽い計算には慣習的に `useMemo` を使わない
- tag hover のような局所調整値は local custom property でよい
- tag / card / back button のように複数ファイルで繰り返す interaction 値のみ global token 化を検討する

---

## 10. Playground の考え方

このプロジェクトは実験サイトであるため、何でも共通データ化することを目的にしない。

### 外に出す判断基準

- 画像だけ → `images.ts`
- 各ページ専用の長い本文 → そのページ専用ファイル
- Home 用メタデータ → `_registry/experiments.ts`
- 軽い固定文言 → `page.tsx` 直置きでも可

### 原則

構造として共通化すべきものと、ページ固有の文脈として残すべきものを分けて整理する。

### steps / page専用データの扱い

- ページ専用の `steps.tsx` は、そのページフォルダ内に同居させてよい
- 完全な純データ化を目的にしない
- `ReactNode` を使う柔軟性は許容する
- ただし、本文の見た目統一が必要な場合は `StepParagraph` / `StepNote` のような小さな presentational component を使う

---

# Appendix. Rulebook Update Policy

## 更新方針

このファイルは `Chiaki Frontend Rulebook v8` を基準版とする。  
今後ルールを更新する場合は、単なる追記ではなく、次の原則で更新する。

### 1. 競合する方針は上書きする

古い方針と新しい方針が競合する場合は、両方を残さない。

### 2. 検証中の内容は本文に入れない

まだ再利用性が確定していない試行は本文に入れず、基準化できた段階で反映する。

### 3. 案件固有の内容は Part 3 に限定する

- 案件をまたいで使える内容 → Part 1 / Part 2
- 現在のプロジェクトだけに有効な内容 → Part 3

### 4. token 変更時は値まで明記する

spacing / typography / color などの token を更新する場合は、名前だけでなく値まで本文に反映する。

### 5. ルール変更時は version を上げる

表現修正のみなら version を上げなくてもよい。  
実質的な方針変更がある場合は version を更新する。

### 6. 更新履歴を末尾に残す

最低限、次の情報を記載する。

- version
- 更新日
- 変更概要

---

## 更新履歴

### v8

- 更新日: 2026-04-02
- Global / Local の責務分離に token / custom property 運用ルールを追加
- 1:1 の token alias を作らない方針を明文化
- global token で足りる場合は直接使う方針を追加
- local custom property を構造寸法・計算用・複数参照値に限定
- 既存 token に十分近い値は統合し、新規 token を増やさない方針を追加
- color token の使い方を整理し、ページ専用 color token の増殖を避ける方針を追加
- GSAP 実装整理ルールを追加
- Home / steps / interaction token 運用の補足を追加

### v7

- Responsive 設計に shared breakpoints ルールを追加
- breakpoint を `48rem / 64rem / 75rem / 90rem` に統一
- Desktop Motion Gating を追加
- GSAP の有効条件を `breakpoint + capability + reduced motion` に統一
- Home のグリッド基準を shared breakpoint に更新
- GSAP / Lenis / parallax の運用方針に Desktop Motion Gating との整合ルールを追加

### v6

- shared breakpoint の追記を追加
- ブレイクポイントの乱立を避ける方針を明文化
- app 全体で使用する breakpoint を `48rem / 64rem / 75rem / 90rem` に統一
- Home のグリッド基準を shared breakpoint ベースへ整理

### v5

- Part 構成を `Core Principles / Shared Implementation Rules / Current Project Rules` に再編
- 重複していた内容を整理し、判断基準と実装ルールを分離
- `Next.js / React`、`レイアウト`、`CSS`、`token`、`アクセシビリティ` の順に再配置
- Project 固有ルールを `Current Project Rules` に集約
- Home / Lenis / GSAP / Registry の位置づけを整理
- 読み順を「思想 → 共通実装 → 現案件」に統一

### v4

- primitive / semantic token の設計を追加
- radius / motion / blur / control / panel / ui-line / ui-dot token を明記
- カラー設計を OS テーマ対応前提に更新
- `dummy-*` token を廃止
- viewport 高さと full-height section の扱いを整理
- ダミー section とメイン section の背景差の考え方を更新

### v3

- OSテーマ対応を正式ルール化
- globals.css の token ベーステーマ切り替え方針を追加
- viewport 高さ（vh / svh / dvh）ルールを追加

### v2

- `Next.js / React の基本方針` を追加
- `アクセシビリティ運用ルール` を追加
- `hover / pointer 運用ルール` を追加
- `パフォーマンス判断基準` を追加
- Home の幅ルールを `.container` + `--container-wide` 方針に更新
- Lenis / ScrollTrigger の scroll restoration 方針を実装に合わせて更新

### v1

- 初版作成
- General Coding Rules と Current Project Context を統合
- 最新の `globals.css` に合わせて token 設計を反映
- Rulebook Update Policy を追加
