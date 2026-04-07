# Media Query / Breakpoint Unification Proposal

## lib/media-queries.ts

```ts
export const BREAKPOINTS = {
  md: '48rem',
  lg: '64rem',
  xl: '75rem',
  xxl: '90rem',
} as const;

export const MEDIA_QUERIES = {
  mdUp: `(min-width: ${BREAKPOINTS.md})`,
  lgUp: `(min-width: ${BREAKPOINTS.lg})`,
  xlUp: `(min-width: ${BREAKPOINTS.xl})`,
  xxlUp: `(min-width: ${BREAKPOINTS.xxl})`,

  hoverable: '(hover: hover) and (pointer: fine)',
  touch: '(hover: none), (pointer: coarse)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  noReducedMotion: '(prefers-reduced-motion: no-preference)',

  desktopMotion: `(min-width: ${BREAKPOINTS.lg}) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`,
} as const;
```

## globals.css (comment block replacement)

```css
/* app/globals.css */
@import 'tailwindcss';

/* =========================================================
   Breakpoint policy
   - Shared breakpoints are fixed across the app.
   - Use only these values unless a structural exception is unavoidable.
   - Write media queries in rem.
   - Prefer min-width as the default responsive direction.
   - Treat the base style as mobile / narrow layout.
   - Add structure progressively at larger breakpoints.
   - If a max-width rule is needed, treat it as a local exception.

   Shared breakpoints
   - 48rem = 768px
   - 64rem = 1024px
   - 75rem = 1200px
   - 90rem = 1440px

   Responsive principle
   - Size changes -> clamp()
   - Structure changes -> @media
   - Layout breakpoint and motion capability are separate concerns

   Color system
   - Prefer solid tokens first: background / foreground / surface / border
   - Alpha tokens must stay limited and role-based
   - Reuse existing opacity steps before adding new ones
   - Align light / dark by perceived contrast, not strict numeric symmetry
   - Do not create one-off color tokens for page-only visual tweaks
========================================================= */
```

## app/experiments/layout.module.css

```css
.main {
  background: var(--background);
  color: var(--foreground);
  overflow-x: clip;
}

.back {
  position: fixed;
  top: clamp(var(--space-md), 2vw, var(--space-xl));
  left: clamp(var(--space-md), 2vw, var(--space-xl));
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-lg);
  border: 1px solid var(--control-border);
  border-radius: var(--radius-pill);
  background: var(--control-bg);
  color: var(--foreground);
  text-decoration: none;
  backdrop-filter: blur(var(--blur-frosted));
  -webkit-backdrop-filter: blur(var(--blur-frosted));
  transition:
    border-color var(--duration-ui) ease,
    background-color var(--duration-ui) ease,
    transform var(--duration-ui) ease,
    opacity var(--duration-ui) ease;
}

.back:focus-visible {
  outline: none;
  border-color: var(--border-3);
  background: var(--control-bg-hover);
}

.before,
.after {
  min-height: 100vh;
  min-height: 100svh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  padding-block: var(--layout-md);
  background: var(--background);
}

.container {
  width: min(var(--container), calc(100% - (var(--gutter) * 2)));
  margin-inline: auto;
  display: grid;
  gap: var(--space-xs);
}

.kicker {
  margin: 0;
  font-size: var(--font-label);
  line-height: 1;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--text-dim);
}

.sectionTitle {
  margin: 0;
  font-size: var(--font-display-xl);
  line-height: 1.02;
  letter-spacing: var(--tracking-tight);
  font-weight: var(--weight-regular);
  color: var(--text-muted);
}

@media (hover: hover) and (pointer: fine) {
  .back:hover {
    border-color: var(--border-3);
    background: var(--control-bg-hover);
    transform: translateY(var(--motion-lift-xs));
  }
}

@media (hover: none) {
  .back:active {
    opacity: var(--motion-fade-press);
    transform: scale(var(--motion-press));
  }
}

@media (min-width: 48rem) {
  .before,
  .after {
    padding-block: var(--layout-lg);
  }

  .back {
    padding-inline: var(--space-lg);
  }

  .container {
    gap: var(--space-sm);
  }
}
```

## Optional note for rulebook v10

```md
### Responsive direction

- 設計の発想が desktop-first でもよい
- ただし CSS の標準実装は mobile-first を基本とする
- base style は narrow layout として書き、必要な構造だけを `min-width` で追加する
- `max-width` は例外的な打ち消しや局所調整に限定する

### breakpoint / motion の分離

- breakpoint はレイアウト構造の切り替えに使う
- hover / pointer / reduced-motion は操作環境の判定に使う
- 「desktop だから動かす」ではなく、`MEDIA_QUERIES.desktopMotion` を満たすときだけ動かす
```
