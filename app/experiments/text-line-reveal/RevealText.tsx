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

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      const childElements = Array.from(container.children).filter(
        (node): node is HTMLElement => node instanceof HTMLElement,
      );

      if (!childElements.length) return;

      const splits: SplitText[] = [];
      const lines: HTMLElement[] = [];

      childElements.forEach(element => {
        const split = SplitText.create(element, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'line++',
          lineThreshold: 0.1,
        });

        splits.push(split);

        const computedStyle = window.getComputedStyle(element);
        const textIndent = computedStyle.textIndent;

        if (textIndent && textIndent !== '0px' && split.lines.length > 0) {
          split.lines[0].style.paddingLeft = textIndent;
          element.style.textIndent = '0';
        }

        lines.push(...(split.lines as HTMLElement[]));
      });

      if (!lines.length) {
        return () => {
          splits.forEach(split => split.revert());
        };
      }

      gsap.set(lines, { y: prefersReducedMotion ? '0%' : '100%' });

      if (prefersReducedMotion) {
        return () => {
          splits.forEach(split => split.revert());
        };
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

      return () => {
        cancelAnimationFrame(refreshFrame);
        tween?.kill();
        splits.forEach(split => split.revert());
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
