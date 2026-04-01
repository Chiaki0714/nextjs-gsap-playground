'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import styles from './page.module.css';
import { STEPS } from './steps';
import { MEDIA_QUERIES } from '@/app/lib/media-queries';

gsap.registerPlugin(ScrollTrigger);

const PIN_DWELL = 1.05;
const LEAD_RATIO = 0.12;
const END_LEAD_MULTIPLIER = 2;
const ACTIVE_DOT_EPSILON = 1e-4;

function clampStepIndex(index: number, maxIndex: number) {
  return Math.max(0, Math.min(maxIndex, index));
}

function getIndicatorTopPercent(index: number, total: number) {
  if (total <= 1) return 0;
  return (index / (total - 1)) * 100;
}

export default function FlowVerticalStepsPage() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepsInnerRef = useRef<HTMLDivElement>(null);

  const stepsCount = STEPS.length;
  const lastStepIndex = Math.max(0, stepsCount - 1);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const stepsInner = stepsInnerRef.current;
      if (!root || !stage || !stepsInner) return;

      const q = gsap.utils.selector(root);
      const markEls = q(`.${styles.indicatorMark}`) as HTMLElement[];
      if (!markEls.length) return;

      const mm = gsap.matchMedia();
      const clamp01 = gsap.utils.clamp(0, 1);

      const resetStaticState = () => {
        gsap.killTweensOf(stepsInner);
        gsap.set(stepsInner, { clearProps: 'transform,willChange' });
        root.style.setProperty('--progress', '0');

        markEls.forEach((markEl, index) => {
          if (index === 0) {
            markEl.setAttribute('data-active', 'true');
            return;
          }

          markEl.removeAttribute('data-active');
        });
      };

      mm.add(
        {
          desktopMotion: MEDIA_QUERIES.desktopMotion,
        },
        context => {
          const { desktopMotion } = context.conditions as {
            desktopMotion: boolean;
          };

          resetStaticState();

          if (!desktopMotion) {
            return;
          }

          let activeDotIndex = 0;

          const setActiveDot = (index: number) => {
            const nextIndex = clampStepIndex(index, lastStepIndex);
            if (nextIndex === activeDotIndex) return;

            markEls[activeDotIndex]?.removeAttribute('data-active');
            markEls[nextIndex]?.setAttribute('data-active', 'true');
            activeDotIndex = nextIndex;
          };

          const tween = gsap.to(stepsInner, {
            y: 0,
            ease: 'none',
            paused: true,
          });

          const getScrollableDistance = () => {
            const stageHeight = stage.clientHeight;
            const totalHeight = stepsInner.scrollHeight;

            return Math.max(0, totalHeight - stageHeight);
          };

          const updateTweenTarget = () => {
            const scrollableDistance = getScrollableDistance();

            gsap.set(stepsInner, { willChange: 'transform' });
            tween.vars.y = -scrollableDistance;
            tween.invalidate();

            return scrollableDistance;
          };

          const getScrollEndDistance = () => {
            const scrollableDistance = updateTweenTarget();
            const dwellDistance = window.innerHeight * PIN_DWELL * stepsCount;
            const leadDistance =
              window.innerHeight * LEAD_RATIO * END_LEAD_MULTIPLIER;

            return scrollableDistance + dwellDistance + leadDistance;
          };

          const getMotionProgress = (progress: number) => {
            const motionRange = Math.max(0.0001, 1 - LEAD_RATIO * 2);

            return clamp01((progress - LEAD_RATIO) / motionRange);
          };

          const getActiveDotIndex = (motionProgress: number) => {
            const segments = Math.max(1, lastStepIndex);

            return Math.min(
              lastStepIndex,
              Math.floor(motionProgress * segments + ACTIVE_DOT_EPSILON),
            );
          };

          const scrollTrigger = ScrollTrigger.create({
            trigger: root,
            start: 'top top',
            end: () => `+=${getScrollEndDistance()}`,
            pin: true,
            pinSpacing: true,
            pinType: 'transform',
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              updateTweenTarget();
            },
            onRefresh: () => {
              updateTweenTarget();
            },
            onUpdate: self => {
              const motionProgress = getMotionProgress(self.progress);

              root.style.setProperty('--progress', String(motionProgress));
              tween.progress(motionProgress);
              setActiveDot(getActiveDotIndex(motionProgress));
            },
          });

          const refreshFrameId = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });

          return () => {
            cancelAnimationFrame(refreshFrameId);
            scrollTrigger.kill();
            tween.kill();
            resetStaticState();
          };
        },
      );

      return () => {
        mm.revert();
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
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={styles.indicatorMark}
                  data-index={index}
                  data-active={index === 0 ? 'true' : undefined}
                  style={{
                    top: `${getIndicatorTopPercent(index, stepsCount)}%`,
                  }}
                >
                  <span className={styles.indicatorNo}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.indicatorDot} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div ref={stageRef} className={styles.stage}>
          <div ref={stepsInnerRef} className={styles.stepsInner}>
            {STEPS.map((step, index) => (
              <article key={step.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <p className={styles.cardNo}>
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h2 className={styles.cardTitle}>{step.title}</h2>
                </div>

                <div className={styles.cardBody}>{step.body}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
