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
  {
    title: 'Parallax Layout',
    description:
      'Full-bleed, split, and inset media layouts with scrubbed image parallax',
    href: '/experiments/parallax-layout',
    tags: ['ScrollTrigger', 'Scrub', 'Layout'],
  },
  {
    title: 'Image Reveal Layout',
    description:
      'Pinned text split layout with expanding media reveal and full-bleed transition',
    href: '/experiments/image-reveal-layout',
    tags: ['ScrollTrigger', 'Pin', 'Reveal', 'Layout'],
  },
  {
    title: 'Text Line Reveal',
    description:
      'Full-height editorial layout with scroll-triggered line reveal copy and static media sections',
    href: '/experiments/text-line-reveal',
    tags: ['ScrollTrigger', 'Reveal', 'Layout', 'Intro'],
  },
];

export const ALL_TAGS = [
  'ScrollTrigger',
  'Pin',
  'Scrub',
  'Switch',
  'Reveal',
  'Cards',
  'Layout',
  'Intro',
] as const satisfies readonly Tag[];
