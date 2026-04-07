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

---

## フォルダ運用ルール

### 現役ページ

公開中・Home に載せる実験だけを `app/experiments` に置く。

例:

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

例:

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
- `Parallax Layout Study`

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

### 現在の推奨イメージ

```ts
export const EXPERIMENTS = [
  {
    title: 'Horizontal Scroll',
    description: 'Pinned horizontal layout with scrubbed panel translation',
    href: '/experiments/horizontal-scroll',
    tags: ['ScrollTrigger', 'Pin', 'Scrub', 'Layout'],
  },
  {
    title: 'Section Switch Layout',
    description:
      'Pinned content layout with state-based section switching and progress indicator',
    href: '/experiments/section-switch-layout',
    tags: ['ScrollTrigger', 'Pin', 'Switch', 'Cards', 'Layout'],
  },
  {
    title: 'Vertical Card Flow',
    description:
      'Pinned card layout with vertical progress sync and scrubbed inner flow',
    href: '/experiments/vertical-card-flow',
    tags: ['ScrollTrigger', 'Pin', 'Scrub', 'Cards', 'Layout'],
  },
  {
    title: 'Parallax Layout Study',
    description:
      'Full-bleed, split, and inset media layouts with scrubbed image parallax',
    href: '/experiments/parallax-layout',
    tags: ['ScrollTrigger', 'Scrub', 'Layout'],
  },
];
```

---

## データ配置ルール

### そのページ専用のデータ

そのページのフォルダに同居させる。

例:

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

#### 使い分け

- `sections.ts` = セクション全体の情報を持つ
- `images.ts` = 画像データだけ持つ

例:

```txt
app/experiments/parallax-layout/
  page.tsx
  page.module.css
  images.ts
```

---

## React / Next.js の書き方ルール

### 1. GSAP は `useGSAP` に統一

今後の GSAP 実装は基本 `useGSAP` を使う。

理由:

- cleanup を統一しやすい
- `scope` を使って DOM 探索範囲を閉じやすい
- ページごとの書き方を揃えやすい

### 2. DOM 取得は `containerRef` / `rootRef` 配下に限定

避けたい:

- `document.querySelector(...)`

推奨:

- `const root = rootRef.current`
- `root.querySelector(...)`
- `gsap.utils.toArray(selector, root)`
- `gsap.utils.selector(root)`

### 3. cleanup は effect 内の `return`

GSAP / ScrollTrigger / ticker / listener は必ず cleanup する。

### 4. `dependencies: []` は不要なら書かない

`useGSAP(..., { scope: ref })` だけで十分な時は省略する。

### 5. `useMemo` は必要な時だけ

軽い filter や単純な値には無理に使わない。  
使う理由がある時だけ使う。

---

## レイアウト要素のルール

### 1. `main` は layout 側だけ

`experiments/layout.tsx` など、ページ全体の主要領域だけ `main` にする。

### 2. 各 experiments 子ページの最外層は `section.wrapper`

子ページ側では `main` を使わず、最外層を `section.wrapper` に統一する。

推奨:

```tsx
<section ref={rootRef} className={styles.wrapper}>
  ...
</section>
```

### 3. `section` なのにクラス名だけ `main` にしない

HTML要素の意味とクラス名の意味を合わせる。

避けたい例:

```tsx
<section className={styles.main}>
```

推奨:

- `wrapper`
- `root`
- `section`

このプロジェクトでは **最外層は `section.wrapper` に統一**。

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

### 3. route change 時のリセット

ページ遷移時は以下の順で処理する。

1. `lenis.stop()`
2. `lenis.scrollTo(0, { immediate: true })`
3. 必要なら `window.scrollTo(0, 0)`
4. `requestAnimationFrame(() => ScrollTrigger.refresh())`
5. `lenis.start()`

### 4. `requestAnimationFrame` の考え方

- 今すぐやる処理 = rAF の外
- 計測や refresh など、描画が少し落ち着いてからやりたい処理 = rAF の中

### 5. `requestAnimationFrame(() => ScrollTrigger.refresh())` は必須ではない

常に必須ではないが、以下のような時は入れる価値が高い。

- pin を使う
- 画像が多い
- `Next/Image` を使う
- 全画面セクションが多い
- trigger が複数ある
- レイアウトが複雑
- ページ遷移直後
- ズレやすい構造

---

## GSAP 実装ルール

### 1. 定数は意味があるものだけ切り出す

例:

- `PIN_DWELL`
- `ENTRY_DWELL`
- `EXIT_DWELL`
- `END_MULTIPLIER`
- `IMAGE_START_Y`
- `IMAGE_END_Y`
- `IMAGE_SCALE`

### 2. timeline はシンプルならチェーンで書いてよい

```ts
tl.to(...)
  .to(...)
  .to(...)
```

複雑なら行ごとに分ける。

### 3. 早期 return は問題ない

ただし増えすぎて読みにくい場合は、

- 近い条件をまとめる
- 必要なら setup 関数に切り出す

ただし無理に共通関数化しなくてよい。

### 4. active 状態はできるだけ個別要素に持たせる

避けたい:

- CSS で `data-active-index='0'` のような固定数列挙

推奨:

- 各要素に `data-active='true'` を直接付ける

これにより、step 数や card 数が増えても CSS を増やさずに済む。

---

## ScrollTrigger の使い分け

### 1. `gsap.to/fromTo(..., { scrollTrigger })`

用途:

- 要素単体のアニメーション
- パララックス
- fade
- 単純なスクロール連動

考え方:

- **アニメーションが主役**
- GSAP アニメに ScrollTrigger を直接くっつける

例:

```ts
gsap.fromTo(
  image,
  { yPercent: startY },
  {
    yPercent: endY,
    ease: 'none',
    scrollTrigger: {
      trigger: media,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  },
);
```

### 2. `ScrollTrigger.create({...})`

用途:

- 状態切り替え
- progress の監視
- pin
- dataset / class 更新
- CSS変数更新

考え方:

- **スクロール監視・制御が主役**
- `onUpdate` で細かい処理を書きたい時に向く

### 3. `timeline + scrollTrigger`

用途:

- 横スクロール
- 複数演出を1本で管理
- 連続演出

### 4. `ScrollTrigger.batch(...)`

用途:

- 一覧カード
- reveal
- 同じアニメの繰り返し

---

## Parallax 実装ルール

### 1. trigger と target を分けて考える

parallax は基本的に

- 親コンテナが普通にスクロールされる
- その中の画像だけがズレて動く
- そのズレで奥行き感を出す

という構造。

### 2. 今回のルール

- `trigger` = `.media`
- `target` = `.mediaImage`

理由:

- `.media` は表示領域・基準枠
- `.mediaImage` は実際に動く対象
- `data-depth` も `.media` に持たせると意味が揃う

### 3. `data-depth` は画像ごとの動きの倍率

例:

```tsx
<div className={styles.media} data-depth='1.05'>
```

```ts
const depth = Number(media.dataset.depth ?? '1');
const startY = IMAGE_START_Y * depth;
const endY = IMAGE_END_Y * depth;
```

意味:

- `depth = 1` → 標準
- `depth < 1` → 弱め
- `depth > 1` → 強め

目安:

- `0.75 ~ 0.9` = 背景・広角・大きい面
- `1.0` = 標準
- `1.05 ~ 1.2` = 差し込み・寄り・見せたい画像

### 4. `.media` を先に取って、その中の `.mediaImage` を探す

例:

```ts
const mediaEls = gsap.utils.toArray<HTMLElement>(`.${styles.media}`, root);

const triggers = mediaEls
  .map(media => {
    const image = media.querySelector(`.${styles.mediaImage}`) as HTMLElement | null;
    if (!image) return null;

    ...
  })
  .filter(Boolean) as ScrollTrigger[];
```

考え方:

- `media` = 親
- `media.querySelector(...)` = その親の中だけを範囲にして子を探す

`document.querySelector(...)` はページ全体を探すが、  
`media.querySelector(...)` は **その要素の内側だけ**を探す。

### 5. `triggers` は cleanup 用

`gsap.fromTo(..., { scrollTrigger })` で trigger は作った瞬間から有効になる。  
配列で保持するのは、アンマウント時にまとめて `kill()` するため。

---

## CSS ルール

### 1. 役割で分ける

- `.card` = リンクやコンテナの性質
- `.inner` = 見た目の箱

### 2. hover / focus-visible を揃える

可能なら hover だけでなく focus-visible も用意する。

### 3. 未使用 CSS は残さない

使っていない `.back` や `.section` などは削除する。

### 4. active 状態は汎用 selector を優先

例:

```css
.indicatorMark[data-active='true'] {
  ...
}
```

固定 index 列挙はなるべく避ける。

---

## Home ページのルール

### 1. Home は「見せる一覧」に徹する

- データは registry に分ける
- UI は `page.tsx`
- card コンポーネントは `NavigationCard`

### 2. フィルタは tag ベース

公開中の実験のみを Home に載せる。  
archive は載せない。

### 3. 説明文は構造ベース

内容差し替えに影響されない文言にする。

---

## playground の考え方

### 1. データ化しすぎない

レイアウト実験では、すべてを data に逃がさない。

主役:

- 画像
- 構造
- 動き

なので、意味の強いテキストやボタンまで全部 `sections.ts` のようなデータに押し込まない。

### 2. 軽いダミーテキストは `page.tsx` に置く

特に parallax やレイアウト study では、  
軽い固定文言を `page.tsx` に直接書いた方が保守・応用しやすい。

### 3. 外に出すべきもの

- 画像だけ → `images.ts`
- 各ページ専用の長い本文 → ページ専用 `steps.tsx` など
- Home 用メタデータ → `_registry/experiments.ts`

---

## コメントのルール

### 学習中

理解のためのコメントは書いてよい。

### 落ち着いてきたら

コメントは減らし、以下だけ残す。

- なぜこの処理が必要か
- 端末差・ScrollTrigger・Lenis 特有の注意点

「何をしているか」はコードで読めるようにする。

---

## このプロジェクトの今の基準ページ

- `horizontal-scroll`
- `section-switch-layout`
- `vertical-card-flow`
- `parallax-layout`

今後の実験ページは、できるだけこの4つの書き方に揃える。

---

## 迷った時の判断基準

### 1. そのコードは内容依存ではないか？

内容（process / about / skills）に寄りすぎていたら、構造ベースに寄せる。

### 2. そのデータは本当に共有か？

共有でないなら、そのページフォルダに置く。

### 3. そのコードは app に置くべきか？

見せないなら `archive` に出す。

### 4. その説明は「何の内容か」ではなく「どういうUIか」になっているか？

内容より構造を優先する。

### 5. その要素は基準か、動かす対象か？

ScrollTrigger / parallax では特に、

- trigger = 基準
- target = 動かす対象

を分けて考える。

---

## 今後の追加ページでも守ること

- `useGSAP` に統一
- `scope` を必ず持つ
- cleanup を明確に書く
- Home メタデータは registry に集約
- フォルダ名 / href / title / description は構造ベースで命名
- 没は `archive` に移す
- 子ページ最外層は `section.wrapper`
- 画像だけ外出しするなら `images.ts`
