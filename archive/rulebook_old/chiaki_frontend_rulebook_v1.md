# Chiaki Frontend Rulebook v1

## はじめに

このルールブックは、今後のコーディング作業を安定して進めるための共通基準です。  
現在進めている Next.js + GSAP Playground の引き継ぎに使えることを前提としつつ、将来の別案件でも叩き台として流用できるように構成しています。

目的は、書き方を単に制限することではなく、後から見返したときに意図が分かりやすく、新しいチャットや別の案件に移った場合でも、同じ基準で即座に作業を開始できる状態を保つことにあります。

このルールブックは、次の 2 部構成で運用します。

1. **General Coding Rules**  
   今後の案件全体で使う共通のコーディング方針と設計ルール

2. **Current Project Context**  
   現在進めている Next.js + GSAP Playground の構造と運用ルール

---

# Part 1. General Coding Rules

## 目的と基本方針

今後のコーディングでは、実務で扱いやすく、保守しやすく、別案件にも転用しやすい構成を優先します。  
一時的に見た目だけ整う書き方よりも、構造が読みやすく、責務が明確で、更新時の判断がしやすい形を選択します。

基本方針は以下の通りです。

- 世界標準で見ても実務的な構成を優先する
- シンプルで読みやすい構造を保つ
- 書き方をできるだけ統一する
- 見た目ではなく役割で設計する
- PC と SP で無理に同じ実装にしない
- 演出より UI の安定を優先する
- 将来のテーマ対応や横展開に備えた構造を維持する

---

## Next.js / React の基本方針

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
- ブラウザ API の利用
- イベントや UI 状態を持つコンポーネント

### 方針

- まず Server Component で成立するかを考える
- 必要な箇所だけを Client Component に切り出す
- ページ全体を慣習的に `use client` にしない
- GSAP を使う責務は可能な限り局所化する

---

## レイアウト設計の基本

ページ構造は、原則として `main > wrapper > container` を基本骨格にします。

```tsx
<main className={styles.main}>
  <section className={styles.wrapper}>
    <div className={styles.container}>...</div>
  </section>
</main>
```

### `main` の役割

`main` はページ全体の土台です。  
背景色、ページ全体の文字色、最小高さなど、ページレベルで管理すべき要素を持たせます。

### `wrapper` の役割

`wrapper` はセクション単位のまとまりです。  
主に縦余白とセクションの区切りを担当します。

### `container` の役割

`container` は中身の幅を制御するための層です。  
`max-width`、左右のガター、内部レイアウトを担当します。

### `inner` の扱い

`inner` は必要な場合にのみ使います。  
毎回慣習的に追加することは避け、追加のラップが明確に必要な場合だけ採用します。

---

## CSS 命名ルール

CSS Modules を前提に、クラス名は **camelCase** で統一します。

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

クラス名は色や見た目ではなく、役割や状態で命名します。  
状態を表す場合は、`tagActive` や `isOpen` のように、状態であることが分かる形を採用します。

---

## グローバルとローカルの使い分け

global utility は補助的に使い、必須の前提にはしません。  
ページ固有の幅設計やレイアウトであれば、module.css 側にローカルの `.container` を持って構いません。

共通化の判断基準は次の通りです。

- 複数ページで同じ振る舞いが必要なものは global
- そのページの責務として完結するものは local
- local で十分な責務は無理に global utility に寄せない
- global token は積極的に使い、global class への依存は必要最小限にする

現在の GSAP Playground では、Home を含むページ幅設計は **module.css 側の `.container` で完結** させます。  
そのうえで、最大幅の基準値は global token の `--container-wide` を使います。

例:

```css
.container {
  width: min(var(--container-wide), calc(100% - (var(--gutter) * 2)));
  margin-inline: auto;
}
```

---

## レスポンシブ設計の考え方

レスポンシブ対応では、次の方針を基準にします。

- **サイズは `clamp()`**
- **構造は `@media`**

### `clamp()` を使う対象

以下のような、連続的に変化してよいものは `clamp()` を優先します。

- `font-size`
- `padding`
- `margin`
- `gap`
- `border-radius`
- 一部の `min-height`

### `@media` を使う対象

以下のように、レイアウトそのものが切り替わる場面では `@media` を使います。

- カラム数の変更
- `flex-direction` の切り替え
- `absolute` から `static` への変更
- `display: none` の制御
- 要素順の入れ替え
- pin の ON / OFF
- desktop 用 UI と mobile 用 UI の分岐

### clamp-first の方針

サイズ設計は **clamp-first** を基本とします。  
同じ padding や font-size を breakpoint ごとに何度も再指定するのではなく、まず `clamp()` で設計し、構造が変わるときだけ `@media` で制御します。

---

## 幅設計の考え方

幅設計では、「背景や演出」と「読む・操作する中身」を分けて考えます。

基本ルールは以下の通りです。

- 背景や演出面はフル幅で考える
- テキストや UI には読みやすい上限幅を持たせる
- `max-width` はページ最外層ではなく `container` 側で制御する

現在の共通トークンは次の通りです。

```css
:root {
  --container: 1280px;
  --container-wide: 1440px;
  --container-ultra: 1600px;
  --prose: 65ch;
  --gutter: clamp(16px, 3vw, 40px);
}
```

`--prose: 65ch;` は本文の可読幅を意識した設定です。

---

## spacing token の設計

余白トークンは、**layout 系** と **space 系** に分けて管理します。

### `--layout-*`

`--layout-*` はページやセクションのような大きい単位の余白に使います。  
fluid spacing として扱い、`clamp()` ベースで設計します。

現在の値は次の通りです。

```css
--layout-xs: clamp(12px, 2vw, 20px);
--layout-sm: clamp(20px, 3vw, 32px);
--layout-md: clamp(32px, 4vw, 48px);
--layout-lg: clamp(48px, 6vw, 72px);
--layout-xl: clamp(64px, 8vw, 112px);
--layout-2xl: clamp(96px, 12vw, 160px);
```

用途:

- セクション上下余白
- ヒーロー下の余白
- 大きなブロック間の余白
- ページ全体の縦リズム

### `--space-*`

`--space-*` はコンポーネント内部や小さい UI 同士の間隔に使います。  
fixed spacing として扱います。

現在の値は次の通りです。

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

用途:

- カードの padding
- ラベルやボタン周りの余白
- セクション内の小さなまとまり
- コンポーネント単位の整列

### token の使い分けルール

運用時の判断を揃えるため、次の基準を追加します。

- `--layout-*` はページやセクション単位の余白に使う
- `--space-*` はカード、ボタン、ラベルなどコンポーネント内部に使う
- `--layout-*` をカード内部 padding に流用しない
- `--space-*` をページ全体の縦リズムに流用しない
- 一時的な magic number を使う場合は、意図がある場合に限る
- 同じ値が複数箇所で繰り返される場合は token 化を検討する

### gap / margin の使い分け

余白の付け方は次の基準で統一します。

- 同列の要素間は `gap`
- 単発の要素間は `margin-top`
- `margin-bottom` は原則使わない

また、2px 程度の差で視覚的な意味が薄い場合は統合し、差を付ける場合は原則 4px 以上を目安にします。  
ただし、実際に意味のある 2px 調整は許容します。

---

## typography token の設計

フォントサイズは現在の最新トークンを基準に運用します。  
最小値の順序崩れは修正済みとし、この状態を正とします。

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

行間、字間、ウェイトの基本値は次の通りです。

```css
--leading-tight: 1.2;
--leading-snug: 1.35;
--leading-normal: 1.6;
--leading-relaxed: 1.8;

--tracking-tight: -0.02em;
--tracking-base: 0;
--tracking-wide: 0.06em;
--tracking-wider: 0.12em;

--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
```

---

## カラー設計の考え方

共通色は CSS 変数で管理します。  
現在はダーク固定で進めますが、将来の OS テーマ対応を考慮し、ベース UI カラーは直書きせず変数へ寄せます。

現在のベーストークンは次の通りです。

```css
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

--dummy-background: #f4f1ea;
--dummy-foreground: rgba(17, 17, 17, 0.72);
--dummy-accent: rgba(17, 17, 17, 0.14);
```

直書き色を完全に禁止するわけではありませんが、共有 UI の基準色は変数で管理します。  
実験ページ専用のグラデーションや一時的な検証色は、そのページ限定で直書きして構いません。

---

## アクセシビリティ運用ルール

見た目だけで状態を伝えず、semantic にも状態を伝えることを基本とします。

### 基本方針

- `button` の active 状態は必要に応じて `aria-pressed` を使う
- `nav`、`main`、`header`、`section` などの landmark を適切に使う
- 見出し階層はページ構造に沿って設計する
- `aria-label` は本当に必要な場合のみ使う
- 既存のテキスト内容で十分伝わる場合は、不要な `aria-label` 上書きをしない
- focus 表示は消さず、`focus-visible` を基準に扱う

### 補足

リンク内に見出しや説明文があり、そのままで内容が十分伝わる場合、`aria-label` は付けない方が自然なことが多いです。

---

## テーマ対応について

現在はダーク固定で進めます。  
優先するのはテーマ切り替えではなく、UI と実験挙動の安定です。

ただし、将来 `prefers-color-scheme` に対応しやすいように、共有色は最初から CSS 変数で管理します。  
今は実装しなくても、後から自然に広げられる土台を維持します。

---

## フォント運用

フォントは `next/font` を基本とします。  
理由は、自動最適化、CLS の抑制、実務上の汎用性が高いためです。

現在の基本構成は次の通りです。

- 英数字: `Inter`
- 日本語: `Noto Sans JP`

`layout.tsx` で読み込み、CSS 変数として body に適用します。  
body の `font-family` は次の形を基準にします。

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

## グローバル CSS の役割

`globals.css` にはプロジェクト全体の土台のみを置きます。

含めるもの:

- design token
- reset / base
- 共通の初期設定
- 本当に共通の layout utility

ページ固有の見た目やコンポーネント固有のスタイルは module.css に持たせます。

現在の `globals.css` には、以下が含まれています。

- `box-sizing: border-box`
- `html`, `body` の背景と高さ
- `body { margin: 0 }`
- media 要素の `display: block; max-width: 100%`
- form 要素の `font: inherit`
- `:focus-visible`
- `prefers-reduced-motion`

この構成を維持します。

---

## reduced motion への対応

`prefers-reduced-motion: reduce` には対応します。  
アニメーションや transition は極端に短縮し、不要な動きを避けます。  
これはアクセシビリティ面と、実験ページにおける挙動安定の両面で重要です。

---

## 実装判断の優先順位

実装で迷った場合は、次の順で判断します。

1. UI が自然か
2. 実機スマホで安定するか
3. 保守しやすいか
4. 後から使い回せるか
5. 演出として気持ちよいか

演出は最後に検討します。  
まずは UI と保守性を優先します。

---

# Part 2. Current Project Context

## 現在のプロジェクト概要

現在進めているのは **Next.js + GSAP Playground** です。  
GSAP の実験ページを増やしながら、後から見返しても分かりやすく、保守しやすく、必要に応じてポートフォリオにも転用できる構成を保つことを目的としています。

このプロジェクトは単なる学習用サンプル置き場ではなく、今後の自分の実装基準を整理し、実案件へ横展開するための基準プロジェクトとして扱います。

---

## フォルダ運用ルール

公開中、または Home に載せる実験だけを `app/experiments` に置きます。

```txt
app/
  experiments/
    horizontal-scroll/
    section-switch-layout/
    vertical-card-flow/
    parallax-layout/
```

今は使わないが残しておきたいもの、没案、試作段階のものは `app` の外へ移します。

```txt
archive/
  experiments/
    old-scrub-layout/
    trial-01/
```

基本ルールは次の通りです。

- `app` の中 = 現在見せるもの
- `archive` の中 = 保管用
- 完全に不要になったものは削除し、必要に応じて Git 履歴で追う

---

## 命名ルール

### フォルダ名 / href

フォルダ名や URL は、内容ではなく **構造と挙動** で命名します。

避ける例:

- `process`
- `about`
- `skills`

推奨例:

- `horizontal-scroll`
- `section-switch-layout`
- `vertical-card-flow`
- `parallax-layout`

### タイトル

Home で探す際に認識しやすいよう、タイトルも内容依存を避けます。

推奨例:

- `Horizontal Scroll`
- `Section Switch Layout`
- `Vertical Card Flow`
- `Parallax Layout`

### 説明文

説明文は「何の内容か」ではなく、「どういう構造と動きか」を記述します。

推奨例:

- `Pinned horizontal layout with scrubbed panel translation`
- `Pinned content layout with state-based section switching and progress indicator`
- `Pinned card layout with vertical progress sync and scrubbed inner flow`
- `Full-bleed, split, and inset media layouts with scrubbed image parallax`

---

## experiments registry ルール

Home 用メタデータは `app/experiments/_registry/experiments.ts` に集約します。

ここに置くもの:

- `title`
- `description`
- `href`
- `tags`

ここに置かないもの:

- 実験ページ固有の JSX
- 各ページ固有の step データ本文
- 長いロジック

registry は一覧表示のためのメタ情報置き場として扱います。

---

## データ配置ルール

そのページ専用のデータは、そのページのフォルダに同居させます。

```txt
app/experiments/section-switch-layout/
  page.tsx
  page.module.css
  steps.tsx
```

共有する意味があるものだけを上に上げます。  
基本は次の通りです。

- 専用のものは同じフォルダ
- 共有するものだけ共通化する

画像だけを切り出す場合は `sections.ts` ではなく `images.ts` を使います。

- `sections.ts` = セクション全体の情報
- `images.ts` = 画像データのみ

---

## React / Next.js の書き方ルール

### GSAP は `useGSAP` に統一する

GSAP 実装は原則 `useGSAP` を使います。  
cleanup を統一しやすく、`scope` によって DOM 探索範囲を限定しやすく、ページごとの実装方針も揃えやすいためです。

### DOM 取得は `rootRef` / `containerRef` 配下に限定する

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

### cleanup は必ず return で行う

GSAP / ScrollTrigger / ticker / listener は、effect または `useGSAP` の `return` で必ず cleanup します。

### `useMemo` は必要な時だけ使う

軽い filter や単純な値のために、慣習的に `useMemo` を使いません。  
必要性が明確な場合のみ採用します。

---

## レイアウト要素のルール

Home や layout 側の主要領域には `main` を使って構いません。  
一方、experiments の子ページでは最外層を `section.wrapper` に統一します。

```tsx
<section ref={rootRef} className={styles.wrapper}>
  ...
</section>
```

また、HTML 要素とクラス名の意味は一致させます。  
要素の意味とクラス名の意味がずれる書き方は避けます。

---

## Home ページのルール

Home は実験ページの一覧 UI として扱います。  
そのため、ScrollTrigger による重い演出よりも、一覧としての軽さ、可読性、絞り込みやすさを優先します。

### Home で優先すること

- 一覧性
- 可読性
- 絞り込みやすさ
- 軽さ
- 将来の実験追加のしやすさ

### Home 一覧では ScrollTrigger を使わない

Home のカード一覧では、基本的に `ScrollTrigger.batch()` を使いません。  
初回表示やフィルタ切り替えは、`gsap.set` + `gsap.to` のみで軽く見せます。

### フィルタ切り替え時のアニメーション基準

現時点の Home 基準は次の通りです。

- `autoAlpha: 0 -> 1`
- `y: 18 -> 0`
- `duration: 0.65`
- `stagger: 0.06`
- `ease: 'power2.out'`

### `prefers-reduced-motion` には対応する

`prefers-reduced-motion: reduce` の端末では、一覧アニメーションを即表示に切り替えます。

### Home の幅とグリッド

一覧性を優先し、Home では `containerWide` を使います。  
カードグリッドは現時点で次の基準です。

- SP: 1 列
- `860px` 以上: 2 列
- `1200px` 以上: 3 列

### Empty State の扱い

タグに紐づく項目が 0 件のときは、カード風に強く見せません。  
border や background を強く付けず、補足テキストとして控えめに見せます。  
横幅は `56ch` 前後に抑えます。

---

## Lenis / ScrollTrigger ルール

### Lenis は Provider で一元管理する

`LenisProvider` に次のような処理を寄せます。

- Lenis 初期化 / destroy
- GSAP ticker 連携
- `ScrollTrigger.update` 連携
- route change 時の scroll reset
- `ScrollTrigger.config(...)`
- 端末特性に応じた Lenis ON / OFF 判定

### グローバル設定はページごとに書かない

たとえば `ScrollTrigger.config({ ignoreMobileResize: true })` のような設定は、ページごとではなく Provider 側でまとめて管理します。

### Lenis の ON / OFF 方針

このプロジェクトでは、**viewport 幅だけで Lenis を切りません**。  
小さいノートPCや狭い desktop window まで意図せず native scroll に落ちるのを避けるためです。

判定は、主に次の端末特性で行います。

- `prefers-reduced-motion: reduce` → Lenis OFF
- `pointer: coarse` かつ `hover: none` → Lenis OFF
- それ以外の desktop / laptop 環境 → Lenis ON

方針としては、

- desktop / laptop は Lenis ON
- スマホ / タブレットなどタッチ中心端末は Lenis OFF
- reduced motion 環境は Lenis OFF
- タッチ端末では native scroll を優先する

とします。

### scroll restoration の方針

scroll restoration は、**同一ページのリロード時** と **App Router 内のページ遷移時** で扱いを分けます。

- 同一ページのリロード時は、ブラウザ標準の restoration を尊重する
- ページ遷移時は、先頭へ scroll reset する
- reset 後に `ScrollTrigger.refresh()` を行い、計測を整える

このため、`window.history.scrollRestoration` は常時 `manual` 固定にしません。  
Provider では `auto` を前提にし、route change 側で reset を制御します。

### route change 時のリセット

ページ遷移時は、ネイティブ scroll と Lenis の両方を確実に先頭へ戻します。

- `lenis.scrollTo(0, { immediate: true })`（Lenis 有効時）
- `window.scrollTo(0, 0)`
- `document.documentElement.scrollTop = 0`
- `document.body.scrollTop = 0`
- `ScrollTrigger.clearScrollMemory?.()`
- 必要に応じて `requestAnimationFrame` 後に `ScrollTrigger.refresh()`

### Home のような軽い一覧では ScrollTrigger を避ける

ScrollTrigger は、本当にスクロール連動が必要なページだけに使います。

---

## ScrollTrigger の使い分け

ScrollTrigger は用途ごとに使い分けます。

### `gsap.to` / `gsap.fromTo`

アニメーション自体が主役のときに使います。  
用途:

- parallax
- fade
- 単体要素の reveal

### `ScrollTrigger.create`

監視や状態管理が主役のときに使います。  
用途:

- pin
- progress 監視
- dataset 更新
- state switch

### `timeline + scrollTrigger`

複数演出を一本の流れで管理したいときに使います。  
用途:

- 横スクロール
- 連続演出
- 一連のモーション制御

---

## Parallax 実装ルール

parallax では trigger と target を分けて考えます。  
このプロジェクトでは基本的に以下の構造を採用します。

- trigger = `.media`
- target = `.mediaImage`

また、動きの強さは `data-depth` で管理します。

- `1.0` = 標準
- `1 未満` = 弱め
- `1 より大きい` = 強め

---

## Playground の考え方

このプロジェクトは実験サイトであるため、何でも共通データ化することを目的にしません。  
ページの主役が画像・構造・動きである場合は、軽い固定文言を `page.tsx` に直接置いて構いません。

外に出す対象は次の基準で判断します。

- 画像だけ → `images.ts`
- 各ページ専用の長い本文 → そのページ専用の `steps.tsx` など
- Home 用メタデータ → `_registry/experiments.ts`

構造として共通化すべきものと、ページ固有の文脈として残すべきものを分けて整理します。

---

## 今後の作業方針

今後は Home を基準ページのひとつとしてルールを固め、そこから `section-switch-layout`、`parallax-layout`、その他の実験ページへ横展開します。

今後も揃えていく対象は、主に次の通りです。

- 幅設計
- 命名
- カラー
- spacing token の使い方
- Lenis の方針
- GSAP / ScrollTrigger の使い分け
- mobile での静的レイアウト化の考え方

---

# Appendix. Rulebook Update Policy

## このルールブックの更新方針

このファイルは `Chiaki Frontend Rulebook v1` を基準版とします。  
今後ルールを更新する場合は、単に追記して肥大化させるのではなく、次の原則で更新します。

### 1. 既存方針と競合する内容は上書きする

古い方針と新しい方針が競合する場合は、両方を残しません。  
古い内容を残したまま追記すると、後から見たときに判断がぶれるためです。

### 2. 一時的な試行は本文に入れない

まだ検証中で、次の案件でも再利用するか分からない内容は本文に入れません。  
本当に基準化したいと判断できた段階で反映します。

### 3. 案件固有の内容は Part 2 に限定する

案件共通で使える内容は Part 1 に入れます。  
現在のプロジェクトにのみ有効な情報は Part 2 に入れます。  
この分離を崩さないことを更新時の前提とします。

### 4. token 変更時は値まで明記する

spacing / typography / color などの token を更新する場合は、名前だけではなく実際の値も本文に反映します。  
記載の粒度を section ごとに変えないようにします。

### 5. 更新時は version を上げる

ルールの内容が変わった場合は、`v1`, `v2`, `v3` のように version を更新します。  
軽微な表現修正のみで方針が変わらない場合は、version を上げなくても構いません。

### 6. 更新履歴を末尾に残す

今後はファイル末尾に更新履歴を残します。  
最低限、次の情報を記載します。

- version
- 更新日
- 変更概要

---

## 更新履歴

### v1

- 初版作成
- General Coding Rules と Current Project Context を統合
- 最新の `globals.css` に合わせて token 設計を反映
- Rulebook Update Policy を追加
