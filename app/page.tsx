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

const CARD_ENTER_Y = 18;
const CARD_ENTER_DURATION = 0.65;
const CARD_ENTER_STAGGER = 0.06;

export default function Home() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [activeTag, setActiveTag] = useState<ActiveTag>('All');

  const visibleExperiments =
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

      gsap.set(cards, { autoAlpha: 0, y: CARD_ENTER_Y });

      gsap.to(cards, {
        autoAlpha: 1,
        y: 0,
        duration: CARD_ENTER_DURATION,
        stagger: CARD_ENTER_STAGGER,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    },
    { scope: rootRef, dependencies: [activeTag] },
  );

  return (
    <main ref={rootRef} className={styles.main}>
      <section className={styles.section}>
        <div className='containerWide'>
          <div className={styles.inner}>
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

            {visibleExperiments.length > 0 ? (
              <ul className={styles.grid} role='list'>
                {visibleExperiments.map(experiment => (
                  <li key={experiment.href} className={styles.gridItem}>
                    <NavigationCard
                      title={experiment.title}
                      description={experiment.description}
                      href={experiment.href}
                      dataCard
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <section className={styles.empty}>
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
        </div>
      </section>
    </main>
  );
}
