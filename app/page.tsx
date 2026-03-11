'use client';

import { useRef, useState, useMemo } from 'react';
import clsx from 'clsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';
import NavigationCard from './components/ui/NavigationCard';
import {
  ALL_TAGS,
  EXPERIMENTS,
  type ActiveTag,
} from './experiments/_registry/experiments';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTag, setActiveTag] = useState<ActiveTag>('All');

  const visible = useMemo(() => {
    if (activeTag === 'All') return EXPERIMENTS;
    return EXPERIMENTS.filter(experiment =>
      experiment.tags.includes(activeTag),
    );
  }, [activeTag]);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>('.cardFade', root);
      if (!cards.length) return;

      gsap.set(cards, {
        autoAlpha: 0,
        y: 16,
      });

      const triggers = ScrollTrigger.batch(cards, {
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

      return () => {
        triggers.forEach(t => t.kill());
      };
    },
    { scope: containerRef, dependencies: [activeTag] },
  );

  return (
    <main ref={containerRef} className={styles.main}>
      <div className={styles.wrapper}>
        <h1 className={`${styles.title}`}>GSAP Playground</h1>
        <p className={`${styles.subtitle}`}>
          Scroll-driven motion experiments built with Next.js + GSAP
        </p>

        <div className={styles.tags}>
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
        </div>

        <div className={styles.grid}>
          {visible.map(experiment => (
            <NavigationCard
              key={experiment.href}
              className='cardFade'
              title={experiment.title}
              description={experiment.description}
              href={experiment.href}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
