// app/experiments/_registry/experiments.ts
export type Tag =
  | 'ScrollTrigger'
  | 'Pin'
  | 'Scrub'
  | 'Switch'
  | 'Reveal'
  | 'Cards'
  | 'Layout'
  | 'Intro';

export type ActiveTag = Tag | 'All';

export type Experiment = {
  title: string;
  description: string;
  href: string;
  tags: Tag[];
};

export const EXPERIMENTS: Experiment[] = [
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
];

export const ALL_TAGS: Tag[] = [
  'ScrollTrigger',
  'Pin',
  'Scrub',
  'Switch',
  'Reveal',
  'Cards',
  'Layout',
  'Intro',
];
