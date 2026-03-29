export const BREAKPOINTS = {
  md: '48rem',
  lg: '64rem',
  xl: '75rem',
  xxl: '90rem',
} as const;

export const MEDIA_QUERIES = {
  desktopMotion: `(min-width: ${BREAKPOINTS.lg}) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`,
} as const;
