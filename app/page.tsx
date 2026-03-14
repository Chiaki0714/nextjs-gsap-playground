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
      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

      if (prefersReducedMotion) {
        gsap.killTweensOf(cards);
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        isFirstRenderRef.current = false;
        return;
      }

      gsap.killTweensOf(cards);

      if (!cards.length) {
        isFirstRenderRef.current = false;
        return;
      }

      if (isFirstRenderRef.current) {
        gsap.set(cards, {
          autoAlpha: 0,
          y: isCoarsePointer ? 8 : 16,
        });

        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          duration: isCoarsePointer ? 0.45 : 0.6,
          stagger: isCoarsePointer ? 0.05 : 0.07,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        isFirstRenderRef.current = false;
        return;
      }

      gsap.set(cards, {
        autoAlpha: 0,
        y: isCoarsePointer ? 0 : 8,
      });

      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: isCoarsePointer ? 0.35 : 0.45,
        stagger: isCoarsePointer ? 0.04 : 0.05,
        ease: 'power2.out',
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
            <h1 className={styles.title}>GSAP Playground v2</h1>
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
