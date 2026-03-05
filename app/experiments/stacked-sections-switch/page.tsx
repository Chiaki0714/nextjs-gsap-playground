'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import styles from './page.module.css';
import { STEPS } from './steps';

gsap.registerPlugin(ScrollTrigger);

const PIN_DWELL = 1.3; // 1ステップあたりの滞在量（お好みで）

export default function StackedSectionsSwitch() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const pinned = rootRef.current;
      if (!pinned) return;

      // Cross-device stability (esp. iOS address bar resize)
      ScrollTrigger.config({ ignoreMobileResize: true });

      const q = gsap.utils.selector(pinned);
      const textEls = q(`.${styles.textSection}`) as HTMLElement[];
      if (!textEls.length) return;

      const stepsCount = textEls.length;

      let currentIndex = 0;
      let isAnimating = false;

      // Initial state
      gsap.set(textEls, { autoAlpha: 0, y: 28, yPercent: -50 });
      gsap.set(textEls[0], { autoAlpha: 1, y: 0 });
      pinned.style.setProperty('--progress', '0');

      const animateTo = (nextIndex: number, direction: 1 | -1) => {
        if (isAnimating) return;
        if (nextIndex === currentIndex) return;
        if (nextIndex < 0 || nextIndex >= stepsCount) return;

        isAnimating = true;

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
              // pinned.dataset.activeIndex = String(currentIndex);
              pinned.dataset.activeMarker = String(currentIndex);
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

          // ✅ 終了点（stepsCount番目の点）を確実に光らせる
          // progressが1.0にならない端末対策で 0.999 を使う
          const isAtEnd = p >= 0.999;

          if (isAtEnd) {
            pinned.dataset.activeMarker = String(stepsCount); // 最後の点
          } else {
            const targetIndex = Math.min(
              stepsCount - 1,
              Math.floor(self.progress * stepsCount),
            );

            pinned.dataset.activeMarker = String(targetIndex);

            if (targetIndex !== currentIndex) {
              const direction: 1 | -1 = targetIndex > currentIndex ? 1 : -1;

              // Prevent skipping multiple steps on fast scroll
              const nextIndex =
                direction === 1
                  ? Math.min(currentIndex + 1, targetIndex)
                  : Math.max(currentIndex - 1, targetIndex);

              animateTo(nextIndex, direction);
            }
          }
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        st.kill();
      };
    },
    { scope: rootRef, dependencies: [] },
  );

  const stepsCount = STEPS.length;
  const markersCount = stepsCount + 1;

  return (
    <section
      ref={rootRef}
      className={styles.wrapper}
      data-active-index='0'
      data-active-marker='0'
      data-steps={stepsCount}
      data-markers={markersCount}
    >
      <div className={styles.left}>
        <div className={styles.leftHeader} aria-hidden='false'>
          {/* title */}
          <p className={styles.sectionLabel}>process</p>

          {/* indicator */}
          <div className={styles.indicator} aria-hidden='true'>
            <div className={styles.indicatorTrack} />
            <div className={styles.indicatorFill} />
            <div className={styles.indicatorMarks}>
              {Array.from({ length: markersCount }, (_, i) => {
                const leftPct = (i / stepsCount) * 100;
                return (
                  <span
                    key={i}
                    className={styles.indicatorMark}
                    data-index={i}
                    style={{ left: `${leftPct}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* step name list*/}
          <div className={styles.stepList} aria-label='Steps'>
            {STEPS.map((s, i) => (
              <div key={i} className={styles.stepListItem} data-step-index={i}>
                {s.title}
              </div>
            ))}
          </div>
        </div>

        {/* text section */}
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
