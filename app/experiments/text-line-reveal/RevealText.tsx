'use client';

import { useRef } from 'react';

import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(SplitText, ScrollTrigger);

type RevealTextProps = {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
};

const LINE_OFFSET_PERCENT = 100;
const REVEAL_DURATION = 1;
const REVEAL_STAGGER = 0.08;
const MASK_DESCENDER_PADDING = '0.1em';

export default function RevealText({
  children,
  animateOnScroll = true,
  delay = 0,
}: RevealTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (prefersReducedMotion) {
        return;
      }

      const targetElements = Array.from(container.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );

      if (!targetElements.length) return;

      const splits: SplitText[] = [];

      targetElements.forEach(element => {
        const split = SplitText.create(element, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'line++',
          lineThreshold: 0.1,
          autoSplit: true,
          onSplit(self) {
            const lines = (self.lines ?? []).filter(
              (line): line is HTMLElement => line instanceof HTMLElement,
            );
            const masks = (self.masks ?? []).filter(
              (mask): mask is HTMLElement => mask instanceof HTMLElement,
            );

            if (!lines.length) {
              return;
            }

            const textIndent = window.getComputedStyle(element).textIndent;
            const firstLine = lines[0];

            if (textIndent !== '0px' && firstLine) {
              firstLine.style.paddingLeft = textIndent;
              element.style.textIndent = '0';
            }

            if (masks.length) {
              gsap.set(masks, {
                overflowX: 'visible',
                overflowY: 'clip',
                paddingBottom: MASK_DESCENDER_PADDING,
                marginBottom: `-${MASK_DESCENDER_PADDING}`,
              });
            }

            gsap.set(lines, {
              yPercent: LINE_OFFSET_PERCENT,
            });

            if (animateOnScroll) {
              return gsap.to(lines, {
                yPercent: 0,
                duration: REVEAL_DURATION,
                stagger: REVEAL_STAGGER,
                ease: 'power4.out',
                delay,
                scrollTrigger: {
                  trigger: element,
                  start: 'top 75%',
                  once: true,
                },
              });
            }

            return gsap.to(lines, {
              yPercent: 0,
              duration: REVEAL_DURATION,
              stagger: REVEAL_STAGGER,
              ease: 'power4.out',
              delay,
            });
          },
        });

        splits.push(split);
      });

      return () => {
        splits.forEach(split => split.revert());
      };
    },
    { scope: containerRef, dependencies: [animateOnScroll, delay] },
  );

  return <div ref={containerRef}>{children}</div>;
}
