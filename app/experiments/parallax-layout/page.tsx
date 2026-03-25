'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import styles from './page.module.css';
import { PARALLAX_IMAGES } from './images';

gsap.registerPlugin(ScrollTrigger);

const PARALLAX_START = -8;
const PARALLAX_END = 8;
const PARALLAX_SCALE = 1.2;
const PARALLAX_SCRUB = 1;

export default function ParallaxLayoutStudyPage() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const mediaEls = Array.from(
        root.querySelectorAll<HTMLElement>('[data-parallax="media"]'),
      );

      if (!mediaEls.length) return;

      const mm = gsap.matchMedia();

      const clearImages = () => {
        mediaEls.forEach(media => {
          const image = media.querySelector<HTMLElement>(
            '[data-parallax="image"]',
          );
          if (!image) return;

          gsap.killTweensOf(image);
          gsap.set(image, {
            clearProps: 'transform,willChange',
          });
        });
      };

      const refresh = () => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      };

      mm.add(
        {
          desktopParallax:
            '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        },
        context => {
          const { desktopParallax } = context.conditions as {
            desktopParallax: boolean;
          };

          clearImages();

          if (!desktopParallax) {
            refresh();
            return;
          }

          const tweens: gsap.core.Tween[] = [];

          mediaEls.forEach(media => {
            const image = media.querySelector<HTMLElement>(
              '[data-parallax="image"]',
            );
            if (!image) return;

            const depth = Number(media.dataset.depth ?? '1');
            const startY = PARALLAX_START * depth;
            const endY = PARALLAX_END * depth;

            gsap.set(image, {
              yPercent: startY,
              scale: PARALLAX_SCALE,
              willChange: 'transform',
              force3D: true,
            });

            const tween = gsap.fromTo(
              image,
              { yPercent: startY },
              {
                yPercent: endY,
                ease: 'none',
                overwrite: 'auto',
                scrollTrigger: {
                  trigger: media,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: PARALLAX_SCRUB,
                  invalidateOnRefresh: true,
                },
              },
            );

            tweens.push(tween);
          });

          const handleLoad = () => refresh();

          window.addEventListener('load', handleLoad);

          refresh();

          return () => {
            window.removeEventListener('load', handleLoad);
            tweens.forEach(tween => {
              tween.scrollTrigger?.kill();
              tween.kill();
            });
            clearImages();
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
    <section ref={rootRef} className={styles.wrapper}>
      <section className={styles.hero}>
        <div className={styles.media} data-parallax='media' data-depth='1.05'>
          <Image
            src={PARALLAX_IMAGES.hero.src}
            alt={PARALLAX_IMAGES.hero.alt}
            fill
            priority
            sizes='100vw'
            className={styles.mediaImage}
            data-parallax='image'
          />
          <div className={styles.overlayStrong} />
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.kicker}>parallax</p>
          <h1 className={styles.heroTitle}>Basic layout study</h1>
        </div>
      </section>

      <section className={styles.layered}>
        <div
          className={`${styles.media} ${styles.layeredBackgroundMedia}`}
          data-parallax='media'
          data-depth='0.8'
          aria-hidden='true'
        >
          <Image
            src={PARALLAX_IMAGES.layeredBackground.src}
            alt={PARALLAX_IMAGES.layeredBackground.alt}
            fill
            sizes='100vw'
            className={styles.mediaImage}
            data-parallax='image'
          />
          <div className={styles.overlaySoft} />
        </div>

        <div className={styles.layeredBrief}>
          <p className={styles.body}>
            Full-bleed background, offset media, and centered content rhythm.
          </p>
        </div>

        <div className={`${styles.col} ${styles.layeredCover}`}>
          <div className={styles.media} data-parallax='media' data-depth='1.15'>
            <Image
              src={PARALLAX_IMAGES.layeredCover.src}
              alt={PARALLAX_IMAGES.layeredCover.alt}
              fill
              sizes='(max-width: 640px) 100vw, 40vw'
              className={styles.mediaImage}
              data-parallax='image'
            />
            <div className={styles.overlayLight} />
          </div>
        </div>

        <div className={`${styles.col} ${styles.layeredList}`}>
          <div className={styles.item}>
            <h2>Wide frame</h2>
            <p>Full bleed / overlay / scrub</p>
          </div>
          <div className={styles.item}>
            <h2>Close detail</h2>
            <p>Inset media / depth shift</p>
          </div>
          <div className={styles.item}>
            <h2>Text rhythm</h2>
            <p>Centered list / vertical flow</p>
          </div>
        </div>
      </section>

      <section className={styles.split}>
        <div className={`${styles.col} ${styles.splitCopy}`}>
          <p className={styles.kicker}>split section</p>
          <p className={styles.body}>
            Static copy on one side, oversized media on the other.
          </p>
        </div>

        <div className={`${styles.col} ${styles.splitMediaCol}`}>
          <div className={styles.splitMediaWrap}>
            <div
              className={styles.media}
              data-parallax='media'
              data-depth='1.1'
            >
              <Image
                src={PARALLAX_IMAGES.split.src}
                alt={PARALLAX_IMAGES.split.alt}
                fill
                sizes='(max-width: 640px) 100vw, 50vw'
                className={styles.mediaImage}
                data-parallax='image'
              />
              <div className={styles.overlayLight} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.banner}>
        <div className={styles.media} data-parallax='media' data-depth='0.9'>
          <Image
            src={PARALLAX_IMAGES.banner.src}
            alt={PARALLAX_IMAGES.banner.alt}
            fill
            sizes='100vw'
            className={styles.mediaImage}
            data-parallax='image'
          />
          <div className={styles.overlayStrong} />
        </div>

        <div className={styles.bannerCopy}>
          <p className={styles.kicker}>full width</p>
          <h2 className={styles.bannerTitle}>Quiet image depth</h2>
          <p className={styles.bannerBody}>
            Centered copy over a full-width image block, using scrubbed
            translation to keep the motion subtle and readable.
          </p>
        </div>
      </section>

      <section className={styles.footer}>
        <div className={styles.col}>
          <p className={styles.meta}>Reference / Motion / Composition</p>

          <div className={styles.footerLinks}>
            <p className={styles.meta}>Layouts</p>
            <h2>Hero</h2>
            <h2>Split</h2>
            <h2>Banner</h2>
          </div>

          <p className={styles.meta}>Parallax composition study</p>
        </div>

        <div className={`${styles.col} ${styles.footerRightCol}`}>
          <div className={styles.footerRightInner}>
            <div className={styles.footerMedia}>
              <div
                className={styles.media}
                data-parallax='media'
                data-depth='1.1'
              >
                <Image
                  src={PARALLAX_IMAGES.footer.src}
                  alt={PARALLAX_IMAGES.footer.alt}
                  fill
                  sizes='(max-width: 640px) 100vw, 40vw'
                  className={styles.mediaImage}
                  data-parallax='image'
                />
                <div className={styles.overlayLight} />
              </div>
            </div>

            <p className={styles.meta}>ScrollTrigger / Scrub / Layout</p>
          </div>
        </div>
      </section>
    </section>
  );
}
