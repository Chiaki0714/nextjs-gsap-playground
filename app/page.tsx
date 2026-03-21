'use client';

import { useRef, useState } from 'react';
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
  const rootRef = useRef<HTMLElement | null>(null);
  const [activeTag, setActiveTag] = useState<ActiveTag>('All');

  const visible =
    activeTag === 'All'
      ? EXPERIMENTS
      : EXPERIMENTS.filter(experiment => experiment.tags.includes(activeTag));

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root);
      if (!cards.length) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      gsap.killTweensOf(cards);

      if (prefersReducedMotion) {
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.set(cards, { autoAlpha: 0, y: 18 });

      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    { scope: rootRef, dependencies: [activeTag] },
  );

  return (
    <main className={styles.main} ref={rootRef}>
      <section className={styles.wrapper}>
        <div className={styles.container}>
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
              aria-pressed={activeTag === 'All'}
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
                aria-pressed={activeTag === tag}
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
