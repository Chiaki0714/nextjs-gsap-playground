'use client';

import { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';
import NavigationCard from './components/ui/NavigationCard';

gsap.registerPlugin(ScrollTrigger);

type Tag =
  | 'ScrollTrigger'
  | 'Pin'
  | 'Scrub'
  | 'Switch'
  | 'Reveal'
  | 'Cards'
  | 'Layout'
  | 'Intro';

type Experiment = {
  title: string;
  description: string;
  href: string;
  tags: Tag[];
};

const EXPERIMENTS: Experiment[] = [
  {
    title: 'Horizontal Scroll',
    description: 'Pin + scrub + Lenis smooth scroll',
    href: '/experiments/horizontal-scroll',
    tags: ['ScrollTrigger', 'Pin', 'Scrub', 'Layout'],
  },
  {
    title: 'Stacked Sections (Scrub)',
    description: 'Scroll-progress controlled vertical transitions',
    href: '/experiments/stacked-sections',
    tags: ['ScrollTrigger', 'Pin', 'Scrub', 'Layout'],
  },
  {
    title: 'Stacked Sections (Switch)',
    description: 'Class-based vertical state switching',
    href: '/experiments/stacked-sections-switch',
    tags: ['ScrollTrigger', 'Pin', 'Switch', 'Reveal'],
  },
  {
    title: 'Stacked Sections (List Dot)',
    description: 'Line progress + active step dot (no markers)',
    href: '/experiments/stacked-sections-switch-listdot',
    tags: ['ScrollTrigger', 'Pin', 'Switch', 'Cards'],
  },
  {
    title: 'Flow Vertical Steps',
    description: 'Sticky sidebar + step-centered progress sync',
    href: '/experiments/flow-vertical-steps',
    tags: ['ScrollTrigger', 'Scrub', 'Layout', 'Cards'],
  },
];

const ALL_TAGS: Tag[] = [
  'ScrollTrigger',
  'Pin',
  'Scrub',
  'Switch',
  'Reveal',
  'Cards',
  'Layout',
  'Intro',
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTag, setActiveTag] = useState<Tag | 'All'>('All');

  const visible =
    activeTag === 'All'
      ? EXPERIMENTS
      : EXPERIMENTS.filter(e => e.tags.includes(activeTag));

  // カード：フィルタが変わるたびに作り直し（増殖防止）
  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const q = gsap.utils.selector(root);
      const cards = q('.cardFade') as HTMLElement[];
      if (!cards.length) return;

      // 既存の「cardFadeをtriggerにしてる」ScrollTriggerだけ消す
      ScrollTrigger.getAll().forEach(st => {
        const triggerEl = st.vars.trigger as Element | undefined;
        if (
          triggerEl &&
          root.contains(triggerEl) &&
          triggerEl.classList.contains('cardFade')
        ) {
          st.kill();
        }
      });

      // 新しいカードを待機状態に
      gsap.set(cards, { autoAlpha: 0, y: 16 });

      ScrollTrigger.batch(cards, {
        start: 'top 85%',
        once: true,
        onEnter: batch => {
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.55,
            ease: 'power2.out',
            stagger: 0.06,
            overwrite: 'auto',
          });
        },
      });

      ScrollTrigger.refresh();
    },
    { scope: containerRef, dependencies: [activeTag] },
  );

  return (
    <main ref={containerRef} className={styles.main}>
      {/* title */}
      <div className={styles.wrapper}>
        <h1 className={`${styles.title} heroFade`}>GSAP Playground</h1>
        <p className={`${styles.subtitle} heroFade`}>
          Scroll-driven motion experiments built with Next.js + GSAP
        </p>

        {/* tag */}
        <div className={styles.tags}>
          <button
            className={clsx(
              styles.tag,
              activeTag === 'All' && styles.tagActive,
            )}
            onClick={() => setActiveTag('All')}
          >
            All
          </button>

          {ALL_TAGS.map(t => (
            <button
              key={t}
              className={clsx(styles.tag, activeTag === t && styles.tagActive)}
              onClick={() => setActiveTag(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* card */}
        <div className={styles.grid}>
          {visible.map(e => (
            <NavigationCard
              key={e.href}
              className='cardFade'
              title={e.title}
              description={e.description}
              href={e.href}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
