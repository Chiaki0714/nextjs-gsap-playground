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
  const isFirstRenderRef = useRef(true);
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
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      gsap.killTweensOf(cards);

      if (!cards.length) {
        isFirstRenderRef.current = false;
        return;
      }

      if (prefersReducedMotion) {
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        isFirstRenderRef.current = false;
        return;
      }

      const animationSettings = isFirstRenderRef.current
        ? {
            from: { autoAlpha: 0, y: 24 },
            to: {
              autoAlpha: 1,
              y: 0,
              duration: 0.85,
              stagger: 0.08,
              ease: 'power2.out',
              overwrite: 'auto' as const,
            },
          }
        : {
            from: { autoAlpha: 0, y: 18 },
            to: {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.06,
              ease: 'power2.out',
              overwrite: 'auto' as const,
            },
          };

      gsap.set(cards, animationSettings.from);
      gsap.to(cards, animationSettings.to);

      isFirstRenderRef.current = false;
    },
    { scope: rootRef, dependencies: [activeTag] },
  );

  return (
    <main className={styles.main} ref={rootRef}>
      <section className={styles.wrapper}>
        <div className={clsx('containerWide', styles.container)}>
          <header className={styles.header}>
            <h1 className={styles.title}>GSAP Playground</h1>
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

          {visible.length > 0 ? (
            <section className={styles.grid} aria-label='Experiment list'>
              {visible.map(experiment => (
                <NavigationCard
                  key={experiment.href}
                  title={experiment.title}
                  description={experiment.description}
                  href={experiment.href}
                  dataCard
                />
              ))}
            </section>
          ) : (
            <section className={styles.empty} aria-live='polite'>
              <p className={styles.emptyTitle}>
                No experiments in this tag yet.
              </p>
              <p className={styles.emptyDescription}>
                This category is empty for now. New experiments will be added
                later.
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
