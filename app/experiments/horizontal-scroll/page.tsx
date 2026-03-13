'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './page.module.css';

gsap.registerPlugin(ScrollTrigger);

const ENTRY_DWELL = 0.35;
const EXIT_DWELL = 0.35;
const END_MULTIPLIER = 1.5;

export default function HorizontalScrollPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const panelsEl = root.querySelector(
        `.${styles.panels}`,
      ) as HTMLElement | null;
      if (!panelsEl) return;

      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`, root);
      if (!panels.length) return;

      const getTotalMove = () =>
        Math.max(0, panelsEl.scrollWidth - window.innerWidth);

      if (getTotalMove() === 0) return;

      const tl = gsap.timeline({ defaults: { ease: 'none' } });

      tl.to({}, { duration: ENTRY_DWELL })
        .to(panelsEl, {
          x: () => -getTotalMove(),
          duration: panels.length,
        })
        .to({}, { duration: EXIT_DWELL });

      const st = ScrollTrigger.create({
        trigger: `.${styles.wrapper}`,
        start: 'top top',
        end: () => `+=${getTotalMove() * END_MULTIPLIER}`,
        pin: true,
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
      });

      return () => {
        st.kill();
        tl.kill();
      };
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef}>
      <section className={styles.wrapper}>
        <div className={styles.panels}>
          <section className={`${styles.panel} ${styles.p1}`}>ONE</section>
          <section className={`${styles.panel} ${styles.p2}`}>TWO</section>
          <section className={`${styles.panel} ${styles.p3}`}>THREE</section>
          <section className={`${styles.panel} ${styles.p4}`}>FOUR</section>
        </div>
      </section>
    </section>
  );
}
