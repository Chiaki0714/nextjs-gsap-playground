'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';
import { STEPS } from './steps';

gsap.registerPlugin(ScrollTrigger);

const PIN_DWELL = 1.05;
const LEAD_RATIO = 0.12;
const END_LEAD_MULTIPLIER = 2;

export default function FlowVerticalStepsPage() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepsInnerRef = useRef<HTMLDivElement>(null);

  const stepsCount = STEPS.length;

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const stepsInner = stepsInnerRef.current;
      if (!root || !stage || !stepsInner) return;

      const q = gsap.utils.selector(root);
      const markEls = q(`.${styles.indicatorMark}`) as HTMLElement[];
      if (!markEls.length) return;

      const clamp01 = gsap.utils.clamp(0, 1);
      let activeDotIndex = 0;

      const setActiveDot = (index: number) => {
        const nextIndex = Math.max(0, Math.min(markEls.length - 1, index));
        if (nextIndex === activeDotIndex) return;

        markEls[activeDotIndex]?.removeAttribute('data-active');
        markEls[nextIndex]?.setAttribute('data-active', 'true');
        activeDotIndex = nextIndex;
      };

      const getStageViewport = () => {
        const computedStyle = window.getComputedStyle(stage);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        return Math.max(0, stage.clientHeight - paddingTop - paddingBottom);
      };

      const tween = gsap.to(stepsInner, {
        y: 0,
        ease: 'none',
        paused: true,
      });

      const updateTweenTarget = () => {
        const viewport = getStageViewport();
        const totalHeight = stepsInner.scrollHeight;
        const scrollable = Math.max(0, totalHeight - viewport);

        tween.vars.y = -scrollable;
        tween.invalidate();

        return scrollable;
      };

      const computeEnd = () => {
        const scrollable = updateTweenTarget();
        const dwell = stage.clientHeight * PIN_DWELL * stepsCount;
        const leadExtra = stage.clientHeight * LEAD_RATIO * END_LEAD_MULTIPLIER;
        return scrollable + dwell + leadExtra;
      };

      markEls.forEach(el => el.removeAttribute('data-active'));
      markEls[0]?.setAttribute('data-active', 'true');
      root.style.setProperty('--progress', '0');

      const st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${computeEnd()}`,
        pin: true,
        pinSpacing: true,
        pinType: 'transform',
        invalidateOnRefresh: true,
        onRefresh: () => {
          updateTweenTarget();
        },
        onUpdate: self => {
          const progress = self.progress;
          const lead = LEAD_RATIO;
          const motionRange = Math.max(0.0001, 1 - lead * 2);
          const motionProgress = clamp01((progress - lead) / motionRange);

          root.style.setProperty('--progress', String(motionProgress));
          tween.progress(motionProgress);

          const segments = Math.max(1, stepsCount - 1);
          const epsilon = 1e-4;
          const nextActiveDot = Math.min(
            stepsCount - 1,
            Math.floor(motionProgress * segments + epsilon),
          );

          setActiveDot(nextActiveDot);
        },
      });

      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className={styles.wrapper} aria-label='制作フロー'>
      <div className={styles.left}>
        <header className={styles.leftHeader}>
          <p className={styles.sectionLabel}>process</p>
        </header>

        <div className={styles.indicatorWrap} aria-hidden='true'>
          <div className={styles.indicator}>
            <div className={styles.indicatorTrack} />
            <div className={styles.indicatorFill} />

            <div className={styles.indicatorMarks}>
              {STEPS.map((_, i) => {
                const topPct =
                  stepsCount <= 1 ? 0 : (i / (stepsCount - 1)) * 100;

                return (
                  <div
                    key={i}
                    className={styles.indicatorMark}
                    data-index={i}
                    data-active={i === 0 ? 'true' : undefined}
                    style={{ top: `${topPct}%` }}
                  >
                    <span className={styles.indicatorNo}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.indicatorDot} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div ref={stageRef} className={styles.stage}>
          <div ref={stepsInnerRef} className={styles.stepsInner}>
            {STEPS.map((step, i) => (
              <article key={step.title} className={styles.card}>
                <header className={styles.cardHead}>
                  <p className={styles.cardNo}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                </header>

                <div className={styles.cardBody}>{step.body}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
