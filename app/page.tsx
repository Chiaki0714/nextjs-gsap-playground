// app/page.tsx
'use client';

import { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import styles from './page.module.css';
import NavigationCard from './components/ui/NavigationCard';
import {
  ALL_TAGS,
  EXPERIMENTS,
  type ActiveTag,
} from './experiments/_registry/experiments';

export default function Home() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeTag, setActiveTag] = useState<ActiveTag>('All');

  const visible = useMemo(() => {
    if (activeTag === 'All') return EXPERIMENTS;
    return EXPERIMENTS.filter(experiment =>
      experiment.tags.includes(activeTag),
    );
  }, [activeTag]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root);
      if (!cards.length) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReducedMotion) {
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        return;
      }

      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      const y = isCoarsePointer ? 8 : 16;
      const duration = isCoarsePointer ? 0.3 : 0.5;
      const stagger = isCoarsePointer ? 0.03 : 0.06;

      gsap.killTweensOf(cards);
      gsap.set(cards, { autoAlpha: 0, y });

      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: 'power2.out',
        stagger,
        overwrite: 'auto',
      });
    },
    { scope: rootRef, dependencies: [activeTag] },
  );

  return (
    <main className={styles.main} ref={rootRef}>
      <section className={styles.wrapper}>
        <div className={clsx('containerWide', styles.container)}>
          <header className={styles.header}>
            <h1 className={styles.title}>GSAP Playground 0314-1</h1>
            <p className={styles.subtitle}>
              Scroll-driven motion experiments built with Next.js + GSAP
            </p>
          </header>

          <nav className={styles.tags} aria-label='Filter experiments by tag'>
            <button
              type='button'
              className={clsx(
                styles.tag,
                activeTag === 'All' && styles.tagActive,
              )}
              onClick={() => setActiveTag('All')}
            >
              All
            </button>

            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                type='button'
                className={clsx(
                  styles.tag,
                  activeTag === tag && styles.tagActive,
                )}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </nav>

          <section className={styles.grid} aria-label='Experiment list'>
            {visible.map(experiment => (
              <NavigationCard
                key={experiment.href}
                className={styles.card}
                title={experiment.title}
                description={experiment.description}
                href={experiment.href}
                dataCard
              />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
