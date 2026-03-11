'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styles from './page.module.css';
import { STEPS } from '../../app/experiments/section-switch-layout/steps';

gsap.registerPlugin(ScrollTrigger);

const PIN_DWELL = 1.3;

export default function StackedSectionsSwitchListDot() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const pinned = rootRef.current;
      if (!pinned) return;

      ScrollTrigger.config({ ignoreMobileResize: true });

      const q = gsap.utils.selector(pinned);
      const textEls = q(`.${styles.textSection}`) as HTMLElement[];
      if (!textEls.length) return;

      const stepsCount = textEls.length;

      let currentIndex = 0;
      let isAnimating = false;

      // Initial state (central align via yPercent)
      gsap.set(textEls, { autoAlpha: 0, y: 28, yPercent: -50 });
      gsap.set(textEls[0], { autoAlpha: 1, y: 0 });

      pinned.style.setProperty('--progress', '0');
      pinned.dataset.activeIndex = '0';

      const animateTo = (nextIndex: number, direction: 1 | -1) => {
        if (isAnimating) return;
        if (nextIndex === currentIndex) return;
        if (nextIndex < 0 || nextIndex >= stepsCount) return;

        isAnimating = true;

        // List highlight should feel instant
        pinned.dataset.activeIndex = String(nextIndex);

        const current = textEls[currentIndex];
        const next = textEls[nextIndex];

        const exitY = direction === 1 ? -28 : 28;
        const enterY = direction === 1 ? 28 : -28;

        gsap
          .timeline({
            defaults: { duration: 0.55, ease: 'power2.out' },
            onComplete: () => {
              currentIndex = nextIndex;
              isAnimating = false;
            },
          })
          .to(current, { autoAlpha: 0, y: exitY, force3D: true }, 0)
          .fromTo(
            next,
            { autoAlpha: 0, y: enterY },
            { autoAlpha: 1, y: 0, force3D: true },
            0,
          );
      };

      const st = ScrollTrigger.create({
        trigger: pinned,
        start: 'top top',
        end: () => `+=${stepsCount * window.innerHeight * PIN_DWELL}`,
        pin: true,
        pinSpacing: true,
        pinType: 'transform',
        anticipatePin: 1,
        invalidateOnRefresh: true,

        onUpdate: self => {
          const p = self.progress;
          pinned.style.setProperty('--progress', String(p));

          const targetIndex = Math.min(
            stepsCount - 1,
            Math.floor(p * stepsCount),
          );

          if (targetIndex !== currentIndex) {
            const direction: 1 | -1 = targetIndex > currentIndex ? 1 : -1;

            // prevent multi-skip on fast scroll
            const nextIndex =
              direction === 1
                ? Math.min(currentIndex + 1, targetIndex)
                : Math.max(currentIndex - 1, targetIndex);

            animateTo(nextIndex, direction);
          }
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => st.kill();
    },
    { scope: rootRef, dependencies: [] },
  );

  return (
    <section ref={rootRef} className={styles.wrapper} data-active-index='0'>
      <div className={styles.left}>
        <div className={styles.leftHeader}>
          <p className={styles.sectionLabel}>process</p>

          {/* indicator (line only) */}
          <div className={styles.indicator} aria-hidden='true'>
            <div className={styles.indicatorTrack} />
            <div className={styles.indicatorFill} />
          </div>

          {/* step name list */}
          <div className={styles.stepList} aria-label='Steps'>
            {STEPS.map((s, i) => (
              <div key={i} className={styles.stepListItem} data-step-index={i}>
                {s.title}
              </div>
            ))}
          </div>
        </div>

        {/* text stage */}
        <div className={styles.textStage}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.textSection}>
              <h2>{s.title}</h2>
              {s.body}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.imageWrapper}>
          <Image
            src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80'
            alt='abstract'
            fill
            sizes='50vw'
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
      </div>
    </section>
  );
}
