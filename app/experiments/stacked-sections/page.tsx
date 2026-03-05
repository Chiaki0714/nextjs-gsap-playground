'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Image from 'next/image';
import styles from './page.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function StackedSectionsPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(
        `.${styles.textSection}`,
      );

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      sections.forEach((section, i) => {
        tl.fromTo(
          section,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1 },
        );

        tl.to(section, { duration: 2 });

        if (i !== sections.length - 1) {
          tl.to(section, { opacity: 0, y: -60, duration: 1 });
        }
      });

      ScrollTrigger.create({
        trigger: `.${styles.pinSection}`,
        start: 'top top',
        end: () => '+=' + sections.length * window.innerHeight * 1.5,
        scrub: 1.2,
        pin: true,
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
      <section className={styles.pinSection}>
        <div className={styles.wrapper}>
          <div className={styles.left}>
            <div className={styles.textSection}>
              <h2>Introduction</h2>
              <p>静と動の設計。</p>
            </div>

            <div className={styles.textSection}>
              <h2>Philosophy</h2>
              <p>スクロールに意味を持たせる。</p>
            </div>

            <div className={styles.textSection}>
              <h2>Craft</h2>
              <p>細部まで設計されたUI。</p>
            </div>

            <div className={styles.textSection}>
              <h2>Vision</h2>
              <p>余白と流れのデザイン。</p>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.imageWrapper}>
              <Image
                src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
                alt='abstract minimal'
                fill
                priority
                sizes='50vw'
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
