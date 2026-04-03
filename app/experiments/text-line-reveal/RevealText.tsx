'use client';

import { useRef } from 'react';

import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import styles from './page.module.css';

gsap.registerPlugin(SplitText, ScrollTrigger);

type RevealTextProps = {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  className?: string;
};

const MASK_DESCENDER_PADDING = '0.1em';

export default function RevealText({
  children,
  animateOnScroll = true,
  delay = 0,
  className,
}: RevealTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      let cleanup = () => {};
      let cancelled = false;

      const setup = () => {
        if (cancelled) return;

        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

        const childElements = Array.from(container.children).filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );

        if (!childElements.length) return;

        const splits: SplitText[] = [];
        const lines: HTMLElement[] = [];
        const masks: HTMLElement[] = [];

        childElements.forEach(element => {
          const split = SplitText.create(element, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'line++',
            lineThreshold: 0.1,
          });

          splits.push(split);

          const splitLines = (split.lines ?? []).filter(
            (line): line is HTMLElement => line instanceof HTMLElement,
          );
          const splitMasks = (split.masks ?? []).filter(
            (mask): mask is HTMLElement => mask instanceof HTMLElement,
          );

          lines.push(...splitLines);
          masks.push(...splitMasks);

          const textIndent = window.getComputedStyle(element).textIndent;
          const firstLine = splitLines[0];

          if (textIndent && textIndent !== '0px' && firstLine) {
            firstLine.style.paddingLeft = textIndent;
            element.style.textIndent = '0';
          }
        });

        if (!lines.length) {
          cleanup = () => {
            splits.forEach(split => split.revert());
          };
          return;
        }

        if (masks.length) {
          gsap.set(masks, {
            overflowX: 'visible',
            overflowY: 'clip',
            paddingBottom: MASK_DESCENDER_PADDING,
            marginBottom: `-${MASK_DESCENDER_PADDING}`,
          });
        }

        gsap.set(lines, { y: prefersReducedMotion ? '0%' : '100%' });

        if (prefersReducedMotion) {
          cleanup = () => {
            splits.forEach(split => split.revert());
          };
          return;
        }

        const animationProps = {
          y: '0%',
          duration: 1,
          stagger: 0.1,
          ease: 'power4.out',
          delay,
        };

        let tween: gsap.core.Tween | null = null;
        let refreshFrame = 0;

        if (animateOnScroll) {
          tween = gsap.to(lines, {
            ...animationProps,
            scrollTrigger: {
              trigger: container,
              start: 'top 75%',
              once: true,
            },
          });

          refreshFrame = requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        } else {
          tween = gsap.to(lines, animationProps);
        }

        cleanup = () => {
          cancelAnimationFrame(refreshFrame);
          tween?.kill();
          splits.forEach(split => split.revert());
        };
      };

      if ('fonts' in document) {
        document.fonts.ready.then(setup);
      } else {
        setup();
      }

      return () => {
        cancelled = true;
        cleanup();
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay] },
  );

  return (
    <div
      ref={containerRef}
      className={[styles.revealText, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}
