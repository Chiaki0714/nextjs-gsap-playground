'use client';

import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import styles from './page.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScrollPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panelsEl = document.querySelector(
        `.${styles.panels}`,
      ) as HTMLElement;

      const panels = gsap.utils.toArray<HTMLElement>(`.${styles.panel}`);

      const totalMove = panelsEl.scrollWidth - window.innerWidth;

      const tl = gsap.timeline();

      tl.to({}, { duration: 0.4 });

      tl.to(panelsEl, {
        x: -totalMove,
        ease: 'none',
        duration: panels.length,
      });

      tl.to({}, { duration: 0.4 });

      ScrollTrigger.create({
        trigger: `.${styles.pinWrap}`,
        start: 'top top',
        end: () => '+=' + totalMove * 1.5,
        pin: true,
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main ref={containerRef} className={styles.main}>
      {/* PIN ZONE */}
      <section className={styles.pinWrap}>
        <div className={styles.panels}>
          <section className={`${styles.panel} ${styles.p1}`}>ONE</section>
          <section className={`${styles.panel} ${styles.p2}`}>TWO</section>
          <section className={`${styles.panel} ${styles.p3}`}>THREE</section>
          <section className={`${styles.panel} ${styles.p4}`}>FOUR</section>
        </div>
      </section>
    </main>
  );
}
