# Next.js + GSAP Playground ルールメモ

## 目的

このプロジェクトでは、GSAP の実験ページを増やしながら、後から見返しても分かりやすく、保守しやすく、ポートフォリオにも転用しやすい構成を保つ。

---

## 基本方針

- 世界標準で実務的
- シンプルでスマート
- 書き方をできるだけ統一する
- 見た目の都合ではなく、構造と責務で分ける
- その場しのぎのコードより、あとで流用しやすい形を優先する
- PC / SP で無理に同じ実装にせず、UI の安定を優先する
- 演出は必要な場所にだけ入れる
- 後から OS テーマ対応しやすい構造を最初から維持する

---

## フォルダ運用ルール

### 現役ページ

公開中・Home に載せる実験だけを `app/experiments` に置く。

```txt
app/
  experiments/
    horizontal-scroll/
    section-switch-layout/
    vertical-card-flow/
    parallax-layout/
```

### 保留・没・学習用

今は使わないが残しておきたいものは `app` の外に出す。

```txt
archive/
  experiments/
    old-scrub-layout/
    trial-01/
```

### 基本ルール

- `app` の中 = 今見せるもの
- `archive` の中 = 保管用
- 完全に不要なら消す（Git 履歴を使う）

---

## 命名ルール

### 1. フォルダ名 / href

内容ではなく、構造と挙動で命名する。

- 内容ベース: `process`, `about`, `skills` は避ける
- 構造ベース: `section`, `card`, `panel`, `layout`
- 挙動ベース: `scroll`, `switch`, `flow`, `scrub`, `parallax`

推奨:

- `horizontal-scroll`
- `section-switch-layout`
- `vertical-card-flow`
- `parallax-layout`

### 2. タイトル

Home で探す時はタイトルを見るので、タイトルも内容依存を避ける。

推奨例:

- `Horizontal Scroll`
- `Section Switch Layout`
- `Vertical Card Flow`
- `Parallax Layout`

避けたい例:

- `Process Steps`
- `About Section`
- `Skills Flow`

### 3. 説明文

説明は「何を載せているか」ではなく、「どういう構造・動きか」を書く。

推奨例:

- `Pinned horizontal layout with scrubbed panel translation`
- `Pinned content layout with state-based section switching and progress indicator`
- `Pinned card layout with vertical progress sync and scrubbed inner flow`
- `Full-bleed, split, and inset media layouts with scrubbed image parallax`

### 4. CSS Modules のクラス名

このプロジェクトでは **camelCase** に統一する。

理由:

- `styles.textSection` のように TS/JS から扱いやすい
- CSS Modules と相性が良い
- `styles["text-section"]` のような書き方を避けられる

推奨:

- `heroCopy`
- `textSection`
- `tagActive`
- `emptyDescription`

避けたい:

- `text-section`
- `redText`
- `bigBox`

### 5. クラス名は見た目ではなく役割で付ける

避けたい:

- `redText`
- `bigCard`
- `leftBox`

推奨:

- `errorText`
- `featureCard`
- `mediaColumn`

---

## experiments registry ルール

`app/experiments/_registry/experiments.ts` に Home 用メタデータを集約する。

ここに置くもの:

- `title`
- `description`
- `href`
- `tags`

ここに置かないもの:

- 実験ページ固有の JSX
- 各ページ固有の step データ本文
- 長いロジック

---

## データ配置ルール

### そのページ専用のデータ

そのページのフォルダに同居させる。

```txt
app/experiments/section-switch-layout/
  page.tsx
  page.module.css
  steps.tsx
```

### 共有データ

複数ページで使うときだけ上に上げる。

基本方針:

- 専用のものは同じフォルダ
- 共有するものだけ共通化

### 画像だけ外に出す場合

画像だけを切り出すなら `sections.ts` ではなく `images.ts` にする。

使い分け:

- `sections.ts` = セクション全体の情報を持つ
- `images.ts` = 画像データだけ持つ

---

## React / Next.js の書き方ルール

### 1. GSAP は `useGSAP` に統一

今後の GSAP 実装は基本 `useGSAP` を使う。

理由:

- cleanup を統一しやすい
- `scope` を使って DOM 探索範囲を閉じやすい
- ページごとの書き方を揃えやすい

### 2. DOM 取得は `rootRef` / `containerRef` 配下に限定

避けたい:

- `document.querySelector(...)`

推奨:

- `const root = rootRef.current`
- `root.querySelector(...)`
- `gsap.utils.toArray(selector, root)`
- `gsap.utils.selector(root)`

### 3. cleanup は effect / useGSAP 内の `return`

GSAP / ScrollTrigger / ticker / listener は必ず cleanup する。

### 4. `useMemo` は必要な時だけ

軽い filter や単純な値には無理に使わない。  
使う理由がある時だけ使う。

### 5. Home 一覧は ScrollTrigger を使わない

Home のカード一覧は「スクロール連動演出」ではなく「一覧 UI」。

そのため、Home では基本以下にする。

- `ScrollTrigger.batch()` は使わない
- 初回表示 / フィルタ切り替えは `gsap.set` + `gsap.to` のみ
- 一覧 UI は軽さと視認性を優先する

### 6. 一覧 UI のフィルタ切り替えは短いアニメーションで変化を伝える

フィルタ切り替え時の基本方針:

- 変化が分かる程度に短く動かす
- 速すぎてバグっぽく見える動きは避ける
- 過剰な演出より、切り替わったことが伝わることを優先する

現時点の Home 基準:

- `autoAlpha: 0 -> 1`
- `y: 18 -> 0`
- `duration: 0.65`
- `stagger: 0.06`
- `ease: 'power2.out'`

### 7. `prefers-reduced-motion` には対応する

`prefers-reduced-motion: reduce` の端末では、一覧アニメーションを即表示に切り替える。

---

## レイアウト要素のルール

### 1. `main` は layout 側の主要領域に使う

Home やレイアウト全体の主要領域には `main` を使ってよい。

### 2. experiments 子ページの最外層は `section.wrapper`

子ページ側では、最外層を `section.wrapper` に統一する。

推奨:

```tsx
<section ref={rootRef} className={styles.wrapper}>
  ...
</section>
```

### 3. HTML要素とクラス名の意味を合わせる

避けたい:

```tsx
<section className={styles.main}>
```

推奨:

- `wrapper`
- `root`
- `section`

---

## 幅設計ルール

### 1. 「背景 / 演出」と「読む / 操作する中身」を分離する

基本ルール:

- 背景・演出 = フル幅
- テキスト・UI = 上限幅あり

### 2. max-width はページ全体に直接持たせない

ページ最外層はフル幅にして、**中身だけ** を `container` 系で制御する。

### 3. 共通幅ユーティリティを使う

`globals.css` に以下を定義し、各ページで使い回す。

- `.container`
- `.containerWide`
- `.prose`
- `.bleed`

### 4. 現在の共通トークン

```css
:root {
  --container: 1280px;
  --container-wide: 1600px;
  --prose: 65ch;
  --gutter: clamp(16px, 3vw, 40px);
}
```

### 5. `ch` の意味

`ch` は文字幅ベースの CSS 単位。  
`65ch` は「だいたい 65 文字分の横幅」の目安で、本文の可読性を保つために使う。

---

## main / wrapper / container の役割

### 1. `main`

- ページ全体の主要領域
- 背景
- 最小高さ
- 全幅の土台

### 2. `wrapper`

- セクションの縦余白
- 要素間のリズム
- ページ固有の縦設計

### 3. `container`

- `max-width`
- 左右ガター
- 中身の幅制御

原則:

- 幅制御は global utility に寄せる
- ページ CSS では縦設計と見た目に集中する

---

## Home ページのルール

### 1. Home は `containerWide` を使う

一覧性を優先し、Home は標準幅より広めの `containerWide` を使う。

### 2. Home のカードグリッド

現時点の基準:

- SP: 1 列
- `860px` 以上: 2 列
- `1200px` 以上: 3 列

### 3. Empty State はカード風にしない

タグに紐づく項目が 0 件のときは、カードのような面で強く見せない。

基本方針:

- border / background は使わない
- 補足テキストとして見せる
- 横幅は `56ch` 前後に抑える

### 4. Empty State は切り替え結果の補足

UI の主役はカード一覧。  
Empty State はその補足なので、強く主張しすぎない。

---

## Lenis / ScrollTrigger ルール

### 1. Lenis は Provider で一元管理

`LenisProvider` に寄せる内容:

- Lenis 初期化
- GSAP ticker 連携
- `ScrollTrigger.update` 連携
- route change 時の scroll reset
- `ScrollTrigger.config(...)`

### 2. `ScrollTrigger.config({ ignoreMobileResize: true })` はページごとに書かない

グローバル設定なので Provider 側にまとめる。

### 3. スマホ / タブレットでは Lenis を切る

このプロジェクトでは、UI 安定性を優先して以下にする。

- PC: Lenis ON
- スマホ / タブレット: Lenis OFF
- タッチ端末はネイティブスクロールを優先する

### 4. route change 時のスクロールリセット

route change 時は、ネイティブ scroll と Lenis の両方を確実に先頭へ戻す。

考え方:

- `window.history.scrollRestoration = 'manual'`
- `lenis.scrollTo(0, { immediate: true })`
- `window.scrollTo(0, 0)`
- `document.documentElement.scrollTop = 0`
- `document.body.scrollTop = 0`
- `ScrollTrigger.clearScrollMemory?.()`
- 必要に応じて `requestAnimationFrame` 後に `ScrollTrigger.refresh()`

### 5. Home のような軽い一覧では ScrollTrigger を避ける

ScrollTrigger は本当にスクロール連動が必要なページだけに使う。

---

## グローバル CSS ルール

### 1. `globals.css` に置くもの

- design token
- reset / base
- layout utility
- 全ページ共通の土台

### 2. `module.css` に置くもの

- ページ固有の見た目
- コンポーネント固有の見た目

### 3. `globals.css` に必ず入れておくベース

- `box-sizing: border-box`
- `html, body` の背景と高さ
- `body { margin: 0 }`
- media 要素の `display: block; max-width: 100%`
- form 要素の `font: inherit`
- `:focus-visible`
- `prefers-reduced-motion`

---

## カラー設計ルール

### 1. 直書き色は禁止しないが、原則は CSS 変数

後から OS テーマ対応しやすくするため、以下は基本的に変数で書く。

- background
- text color
- surface
- border
- muted text

### 2. 現在のベーストークン

```css
:root {
  --background: #0f0f0f;
  --foreground: #ededed;

  --surface-1: #151515;
  --surface-2: #1b1b1b;

  --border-1: #222;
  --border-2: #333;
  --border-3: #444;

  --text-muted: rgba(255, 255, 255, 0.75);
  --text-dim: rgba(255, 255, 255, 0.6);
  --text-strong: rgba(255, 255, 255, 0.92);
}
```

### 3. 実験ページ固有の演出色は直書き可

以下は直書きでもよい。

- 実験専用のグラデーション
- 一時的な検証色
- そのページだけの演出色

ただし、サイト全体トーンに関わる色は変数に寄せる。

### 4. 必要に応じて fallback を使う

コンポーネント側では必要なら以下のように書いてよい。

```css
background: var(--surface-1, #151515);
border-color: var(--border-1, #222);
```

---

## テーマ対応ルール

### 1. 現時点ではダーク固定

今はダーク固定で進める。  
OS テーマ対応は後から追加する前提。

### 2. 将来の OS テーマ対応に備えて、色は変数で管理する

将来は `prefers-color-scheme` を使って `:root` の値を差し替える。

```css
@media (prefers-color-scheme: light) {
  :root {
    --background: #ffffff;
    --foreground: #111111;
  }

  html {
    color-scheme: light;
  }
}
```

### 3. 先にテーマ対応を実装しない理由

- まずは UI と実験挙動を安定させるため
- 現段階ではダーク固定の方が検証しやすいため
- 変数化しておけば後から追加コストが低いため

---

## フォントルール

### 1. `next/font` を使う

フォント読み込みは `next/font/google` を基本にする。

理由:

- 自動最適化
- CLS を抑えやすい
- 実務でも一般的

### 2. 現在の基本構成

- 英数字: `Inter`
- 日本語: `Noto Sans JP`

`layout.tsx` で読み込み、CSS 変数として使う。

### 3. body の font-family

```css
font-family:
  var(--font-inter),
  var(--font-noto-jp),
  system-ui,
  -apple-system,
  'Segoe UI',
  Roboto,
  sans-serif;
```

---

## コンポーネント設計ルール

### 1. NavigationCard

NavigationCard は Home 一覧用の UI コンポーネントとして扱う。

責務:

- タイトル
- 説明文
- href
- hover / focus の見た目

### 2. カードの見た目は極力安定させる

- 枠線あり
- 背景あり
- hover で少し持ち上がる
- 過剰な装飾は避ける

### 3. Home のカードは一覧の土台

実験ページの演出より前に、一覧 UI としての読みやすさを優先する。

---

## 実装判断ルール

迷った時は以下の優先順位で判断する。

1. UI が自然か
2. 実機スマホで安定するか
3. 保守しやすいか
4. 後から使い回せるか
5. 演出として気持ちいいか

「気持ちいい演出」より「壊れにくい UI」を優先する。

---

## 今後の作業方針

- Home を基準ページとしてルールを固める
- そのルールを `section-switch-layout` / `parallax-layout` / 他の実験ページへ横展開する
- 幅設計、命名、カラー、Lenis、アニメーション基準を全ページで揃える
