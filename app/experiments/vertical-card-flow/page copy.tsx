// app/experiments/flow-vertical-steps/page.tsx
'use client';

import { useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';
import { STEPS } from './steps';

gsap.registerPlugin(ScrollTrigger);

const PIN_DWELL = 1.05; // 読む余裕（0.9〜1.3で調整）
const LEAD_RATIO = 0.12; // 入口/出口の“間”（0.08〜0.18で調整）

export default function FlowVerticalStepsPage() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepsInnerRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => STEPS, []);
  const stepsCount = steps.length;

  useGSAP(
    () => {
      const pinned = rootRef.current;
      const stage = stageRef.current;
      const stepsInner = stepsInnerRef.current;
      if (!pinned || !stage || !stepsInner) return;

      ScrollTrigger.config({ ignoreMobileResize: true });

      const clamp01 = gsap.utils.clamp(0, 1);

      const q = gsap.utils.selector(pinned);
      const markEls = q(`.${styles.indicatorMark}`) as HTMLElement[];
      if (!markEls.length) return;

      // 進捗バードット初期設定
      let lastActive = 0;

      const setActiveDot = (index: number) => {
        // indexを1~steps数に収まるように変換（保険）
        const next = Math.max(0, Math.min(markEls.length - 1, index));
        if (next === lastActive) return;

        markEls[lastActive]?.removeAttribute('data-active');
        markEls[next]?.setAttribute('data-active', 'true');
        lastActive = next;
      };

      // 初期点灯
      markEls.forEach(el => el.removeAttribute('data-active'));
      markEls[0]?.setAttribute('data-active', 'true');
      pinned.style.setProperty('--progress', '0');

      // ステップカラムの高さ計算

      const getStageViewport = () => {
        const cs = window.getComputedStyle(stage);
        const pt = parseFloat(cs.paddingTop) || 0;
        const pb = parseFloat(cs.paddingBottom) || 0;
        return Math.max(0, stage.clientHeight - pt - pb);
      };

      const tween = gsap.to(stepsInner, {
        y: 0,
        ease: 'none',
        paused: true,
      });

      const updateTweenTarget = () => {
        // ✅ padding込みのclientHeightだと「最後が見切れる」ので補正する
        const viewport = getStageViewport();
        const total = stepsInner.scrollHeight;
        const scrollable = Math.max(0, total - viewport);

        tween.vars.y = -scrollable;
        tween.invalidate();

        return scrollable;
      };

      const computeEnd = () => {
        const scrollable = updateTweenTarget();
        const dwell = stage.clientHeight * PIN_DWELL * stepsCount;
        const leadExtra = stage.clientHeight * (LEAD_RATIO * 2);
        return scrollable + dwell + leadExtra;
      };

      const st = ScrollTrigger.create({
        trigger: pinned,
        start: 'top top',
        end: () => `+=${computeEnd()}`,
        pin: true,
        pinSpacing: true,
        pinType: 'transform',
        anticipatePin: 2,
        invalidateOnRefresh: true,

        onRefresh: () => {
          updateTweenTarget();
        },

        onUpdate: self => {
          const p = self.progress;

          // 入口/出口の“間”
          const lead = LEAD_RATIO;
          const denom = Math.max(0.0001, 1 - lead * 2);
          const motionP = clamp01((p - lead) / denom);

          pinned.style.setProperty('--progress', String(motionP));
          tween.progress(motionP);

          // dot配置（i/(N-1)）と一致させる：segments = N-1
          const n = stepsCount;
          const segments = Math.max(1, n - 1);
          const eps = 1e-4;
          const active = Math.min(n - 1, Math.floor(motionP * segments + eps));

          setActiveDot(active);
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        st.kill();
        tween.kill();
      };
    },
    { scope: rootRef, dependencies: [stepsCount] },
  );

  return (
    <section ref={rootRef} className={styles.wrapper} aria-label='制作フロー'>
      <div className={styles.left}>
        <header className={styles.leftHeader} aria-hidden='false'>
          <p className={styles.sectionLabel}>process</p>
        </header>

        <div className={styles.indicatorWrap} aria-hidden='true'>
          <div className={styles.indicator}>
            <div className={styles.indicatorTrack} />
            <div className={styles.indicatorFill} />

            <div className={styles.indicatorMarks}>
              {steps.map((_, i) => {
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
            {steps.map((s, i) => (
              <article key={s.title} className={styles.card}>
                <header className={styles.cardHead}>
                  <p className={styles.cardNo}>
                    {String(i + 1).padStart(2, '0')}
                  </p>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                </header>

                <div className={styles.cardBody}>{s.body}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
