'use client';

import { useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import styles from './page.module.css';
import { REVEAL_IMAGE } from './images';

gsap.registerPlugin(ScrollTrigger);

const HEADER_WORDS = ['The', 'Season', 'Wears', 'Confidence'] as const;

const PIN_DISTANCE_MULTIPLIER = 4;
const IMAGE_REVEAL_END = 0.9;
const HEADER_REVEAL_START = 0.4;
const HEADER_REVEAL_END = 0.7;
const INTRO_TEXT_MOVE_RATIO = 0.5;
const INTRO_TEXT_FADE_RATIO = 0.2;
const MIN_VISIBLE_SCALE = 0.001;

const normalizeRange = (value: number, start: number, end: number): number => {
  if (value <= start) return 0;
  if (value >= end) return 1;
  return (value - start) / (end - start);
};

export default function ImageRevealLayoutPage() {
  const rootRef = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const banner = root.querySelector<HTMLElement>('[data-banner="section"]');
      const mediaBox = root.querySelector<HTMLElement>(
        '[data-banner="media-box"]',
      );
      const header = root.querySelector<HTMLElement>('[data-banner="header"]');
      const introTexts = Array.from(
        root.querySelectorAll<HTMLElement>('[data-banner="intro"]'),
      );
      const headerWords = Array.from(
        root.querySelectorAll<HTMLElement>('[data-banner="word"]'),
      );

      if (
        !banner ||
        !mediaBox ||
        !header ||
        introTexts.length !== 2 ||
        !headerWords.length
      ) {
        return;
      }

      const [leftIntroText, rightIntroText] = introTexts;

      const mm = gsap.matchMedia();

      const clearAnimatedState = () => {
        gsap.set([mediaBox, header, ...introTexts, ...headerWords], {
          clearProps: 'all',
        });
      };

      const applyDesktopInitialState = () => {
        gsap.set(mediaBox, {
          width: 0,
          height: 0,
          autoAlpha: 0,
          xPercent: -50,
          yPercent: -50,
          transformOrigin: 'center center',
          willChange: 'width,height,opacity,transform',
        });

        gsap.set(header, {
          scale: MIN_VISIBLE_SCALE,
          transformOrigin: 'center center',
          willChange: 'transform',
        });

        gsap.set(introTexts, {
          x: 0,
          opacity: 1,
          willChange: 'transform,opacity',
        });

        gsap.set(headerWords, {
          opacity: 0,
          willChange: 'opacity',
        });
      };

      const updateMediaBox = (progress: number) => {
        const revealProgress = normalizeRange(progress, 0, IMAGE_REVEAL_END);

        const nextWidth = gsap.utils.interpolate(
          0,
          window.innerWidth,
          revealProgress,
        );
        const nextHeight = gsap.utils.interpolate(
          0,
          window.innerHeight,
          revealProgress,
        );

        gsap.set(mediaBox, {
          width: nextWidth,
          height: nextHeight,
          autoAlpha: revealProgress > MIN_VISIBLE_SCALE ? 1 : 0,
        });
      };

      const updateIntroTexts = (progress: number) => {
        const textProgress = normalizeRange(progress, 0, IMAGE_REVEAL_END);
        const moveDistance = window.innerWidth * INTRO_TEXT_MOVE_RATIO;
        const nextOpacity = 1 - textProgress * INTRO_TEXT_FADE_RATIO;

        if (progress <= IMAGE_REVEAL_END) {
          gsap.set(leftIntroText, {
            x: -textProgress * moveDistance,
            opacity: nextOpacity,
          });

          gsap.set(rightIntroText, {
            x: textProgress * moveDistance,
            opacity: nextOpacity,
          });

          return;
        }

        gsap.set(introTexts, { opacity: 0 });
      };

      const updateHeaderScale = (progress: number) => {
        const revealProgress = normalizeRange(progress, 0, IMAGE_REVEAL_END);
        const nextScale = gsap.utils.interpolate(
          MIN_VISIBLE_SCALE,
          1,
          revealProgress,
        );

        gsap.set(header, {
          scale: nextScale,
        });
      };

      const updateHeaderWords = (progress: number) => {
        const headerProgress = normalizeRange(
          progress,
          HEADER_REVEAL_START,
          HEADER_REVEAL_END,
        );
        const totalWords = headerWords.length;

        if (progress < HEADER_REVEAL_START) {
          gsap.set(headerWords, { opacity: 0 });
          return;
        }

        if (progress > HEADER_REVEAL_END) {
          gsap.set(headerWords, { opacity: 1 });
          return;
        }

        headerWords.forEach((word, index) => {
          const wordStart = index / totalWords;
          const wordEnd = (index + 1) / totalWords;

          let nextOpacity = 0;

          if (headerProgress >= wordEnd) {
            nextOpacity = 1;
          } else if (headerProgress >= wordStart) {
            nextOpacity = (headerProgress - wordStart) / (wordEnd - wordStart);
          }

          gsap.set(word, { opacity: nextOpacity });
        });
      };

      const updateScene = (progress: number) => {
        updateMediaBox(progress);
        updateIntroTexts(progress);
        updateHeaderScale(progress);
        updateHeaderWords(progress);
      };

      mm.add(
        {
          desktopMotion:
            '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        },
        context => {
          const { desktopMotion } = context.conditions as {
            desktopMotion: boolean;
          };

          clearAnimatedState();

          if (!desktopMotion) {
            return;
          }

          applyDesktopInitialState();

          const bannerTrigger = ScrollTrigger.create({
            trigger: banner,
            start: 'top top',
            end: () => `+=${window.innerHeight * PIN_DISTANCE_MULTIPLIER}px`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              applyDesktopInitialState();
            },
            onUpdate: self => {
              updateScene(self.progress);
            },
          });

          const handleLoad = () => {
            applyDesktopInitialState();
            ScrollTrigger.refresh();
          };

          window.addEventListener('load', handleLoad);

          return () => {
            window.removeEventListener('load', handleLoad);
            bannerTrigger.kill();
            clearAnimatedState();
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
      <section className={styles.banner} data-banner='section'>
        <div className={styles.bannerMediaBox} data-banner='media-box'>
          <div className={styles.bannerMedia}>
            <Image
              src={REVEAL_IMAGE.src}
              alt={REVEAL_IMAGE.alt}
              fill
              priority
              sizes='100vw'
              className={styles.bannerImage}
            />
          </div>
        </div>

        <div className={styles.bannerHeader} data-banner='header'>
          <h1 className={styles.bannerHeaderTitle}>
            {HEADER_WORDS.map(word => (
              <span
                key={word}
                className={styles.bannerHeaderWord}
                data-banner='word'
              >
                {word}
              </span>
            ))}
          </h1>
        </div>

        <div className={styles.bannerIntroTextContainer}>
          <div className={styles.bannerIntroText} data-banner='intro'>
            <h1>Surface</h1>
          </div>
          <div className={styles.bannerIntroText} data-banner='intro'>
            <h1>Layered</h1>
          </div>
        </div>
      </section>
    </section>
  );
}
