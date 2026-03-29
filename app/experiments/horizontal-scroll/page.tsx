'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

import styles from './page.module.css';
import { HORIZONTAL_SLIDES, MARQUEE_IMAGES, PIN_IMAGE_INDEX } from './images';
import { MEDIA_QUERIES } from '@/app/lib/media-queries';

gsap.registerPlugin(ScrollTrigger, Flip);

export default function HorizontalScrollPage() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const container = root.querySelector<HTMLElement>(
        '[data-hs="container"]',
      );
      const marquee = root.querySelector<HTMLElement>('[data-hs="marquee"]');
      const marqueeImages = root.querySelector<HTMLElement>(
        '[data-hs="marquee-images"]',
      );
      const horizontal = root.querySelector<HTMLElement>(
        '[data-hs="horizontal"]',
      );
      const horizontalTrack = root.querySelector<HTMLElement>(
        '[data-hs="horizontal-track"]',
      );
      const pinImage = root.querySelector<HTMLImageElement>(
        '[data-hs="pin-image"] img',
      );

      if (
        !container ||
        !marquee ||
        !marqueeImages ||
        !horizontal ||
        !horizontalTrack ||
        !pinImage
      ) {
        return;
      }

      const mm = gsap.matchMedia();

      const getSurfaceColors = () => {
        const computed = getComputedStyle(root);

        return {
          light: computed.getPropertyValue('--horizontal-surface-light').trim(),
          dark: computed.getPropertyValue('--horizontal-surface-dark').trim(),
        };
      };

      const resetStaticState = () => {
        gsap.set(container, { clearProps: 'backgroundColor' });
        gsap.set(marqueeImages, { clearProps: 'xPercent,willChange' });
        gsap.set(horizontalTrack, { clearProps: 'xPercent,willChange' });
        gsap.set(pinImage, { clearProps: 'opacity' });
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

          const { light, dark } = getSurfaceColors();

          let pinnedClone: HTMLImageElement | null = null;
          let isCloneActive = false;
          let flipAnimation: gsap.core.Animation | null = null;

          gsap.set(marqueeImages, {
            xPercent: -75,
            willChange: 'transform',
          });

          const createPinnedClone = () => {
            if (isCloneActive) return;

            const rect = pinImage.getBoundingClientRect();
            const clone = pinImage.cloneNode(true) as HTMLImageElement;

            gsap.set(clone, {
              position: 'fixed',
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              transformOrigin: 'center center',
              pointerEvents: 'none',
              zIndex: 100,
              objectFit: 'cover',
              willChange: 'transform',
            });

            document.body.appendChild(clone);
            gsap.set(pinImage, { opacity: 0 });

            pinnedClone = clone;
            isCloneActive = true;
          };

          const removePinnedClone = () => {
            if (!isCloneActive) return;

            if (flipAnimation) {
              flipAnimation.kill();
              flipAnimation = null;
            }

            if (pinnedClone) {
              pinnedClone.remove();
              pinnedClone = null;
            }

            gsap.set(pinImage, { opacity: 1 });
            isCloneActive = false;
          };

          const getHorizontalPinDistance = () => window.innerHeight * 5;
          const getProgressDistance = () => window.innerHeight * 5.5;

          const marqueeTrigger = ScrollTrigger.create({
            trigger: marquee,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            onUpdate: self => {
              gsap.set(marqueeImages, {
                xPercent: -60 + self.progress * 10,
              });
            },
          });

          const pinSectionTrigger = ScrollTrigger.create({
            trigger: horizontal,
            start: 'top top',
            end: () => `+=${getHorizontalPinDistance()}`,
            pin: true,
            invalidateOnRefresh: true,
          });

          const cloneTrigger = ScrollTrigger.create({
            trigger: marquee,
            start: 'top top',
            onEnter: createPinnedClone,
            onEnterBack: createPinnedClone,
            onLeaveBack: removePinnedClone,
          });

          const flipSetupTrigger = ScrollTrigger.create({
            trigger: horizontal,
            start: 'top 50%',
            end: () => `+=${getProgressDistance()}`,
            onEnter: () => {
              if (!pinnedClone || !isCloneActive || flipAnimation) return;

              const state = Flip.getState(pinnedClone);

              gsap.set(pinnedClone, {
                position: 'fixed',
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight,
                transformOrigin: 'center center',
              });

              flipAnimation = Flip.from(state, {
                duration: 1,
                ease: 'none',
                paused: true,
              });
            },
            onLeaveBack: () => {
              if (flipAnimation) {
                flipAnimation.kill();
                flipAnimation = null;
              }

              gsap.set(container, { backgroundColor: light });
              gsap.set(horizontalTrack, { xPercent: 0 });

              if (pinnedClone) {
                gsap.set(pinnedClone, { xPercent: 0 });
              }
            },
          });

          const progressTrigger = ScrollTrigger.create({
            trigger: horizontal,
            start: 'top 50%',
            end: () => `+=${getProgressDistance()}`,
            invalidateOnRefresh: true,
            onUpdate: self => {
              const progress = self.progress;

              if (progress <= 0.05) {
                gsap.set(container, {
                  backgroundColor: gsap.utils.interpolate(
                    light,
                    dark,
                    Math.min(progress / 0.05, 1),
                  ),
                });
              } else {
                gsap.set(container, { backgroundColor: dark });
              }

              if (progress <= 0.2) {
                flipAnimation?.progress(progress / 0.2);
                return;
              }

              if (progress <= 0.95) {
                flipAnimation?.progress(1);

                const horizontalProgress = (progress - 0.2) / 0.75;
                const wrapperTranslateX = -66.67 * horizontalProgress;

                gsap.set(horizontalTrack, { xPercent: wrapperTranslateX });

                if (pinnedClone) {
                  gsap.set(pinnedClone, {
                    xPercent: -200 * horizontalProgress,
                  });
                }

                return;
              }

              flipAnimation?.progress(1);
              gsap.set(horizontalTrack, { xPercent: -66.67 });

              if (pinnedClone) {
                gsap.set(pinnedClone, { xPercent: -200 });
              }
            },
          });

          const handleLoad = () => {
            ScrollTrigger.refresh();
          };

          window.addEventListener('load', handleLoad);

          return () => {
            window.removeEventListener('load', handleLoad);
            marqueeTrigger.kill();
            pinSectionTrigger.kill();
            cloneTrigger.kill();
            flipSetupTrigger.kill();
            progressTrigger.kill();
            flipAnimation?.kill();
            removePinnedClone();
            resetStaticState();
            ScrollTrigger.clearScrollMemory?.();
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
      <div className={styles.container} data-hs='container'>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Fragments of thought arranged in sequence become patterns. They
            unfold step by step, shaping meaning as they move forward.
          </h1>
        </section>

        <section className={styles.marquee} data-hs='marquee'>
          <div className={styles.marqueeWrapper}>
            <div className={styles.marqueeImages} data-hs='marquee-images'>
              {MARQUEE_IMAGES.map((image, index) => {
                const isPinTarget = index === PIN_IMAGE_INDEX;

                return (
                  <div
                    key={`${image.src}-${index}`}
                    className={styles.marqueeItem}
                    data-hs={isPinTarget ? 'pin-image' : undefined}
                  >
                    <div className={styles.marqueeMedia}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes='(max-width: 64rem) 38vw, 18vw'
                        className={styles.image}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.horizontal} data-hs='horizontal'>
          <div className={styles.horizontalTrack} data-hs='horizontal-track'>
            <div
              className={`${styles.horizontalSlide} ${styles.horizontalSpacer}`}
              aria-hidden='true'
            />

            {HORIZONTAL_SLIDES.map(slide => (
              <article key={slide.title} className={styles.horizontalSlide}>
                <div className={styles.slideColumn}>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                  <p className={styles.slideBody}>{slide.body}</p>
                </div>

                <div className={styles.slideColumn}>
                  <div className={styles.slideMedia}>
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      sizes='(max-width: 64rem) 100vw, 38vw'
                      className={styles.image}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.outro}>
          <h2 className={styles.outroTitle}>
            Shadows fold into light. Shapes shift across the frame, reminding us
            that stillness is only temporary.
          </h2>
        </section>
      </div>
    </section>
  );
}
