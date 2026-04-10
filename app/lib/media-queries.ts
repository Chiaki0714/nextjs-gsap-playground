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
