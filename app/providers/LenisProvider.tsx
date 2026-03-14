// app/providers/LenisProvider.tsx
'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

export default function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const isLenisEnabledRef = useRef(false);

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isSmallViewport = window.matchMedia('(max-width: 1024px)').matches;
    const shouldDisableLenis = isCoarsePointer || isSmallViewport;

    if (shouldDisableLenis) {
      isLenisEnabledRef.current = false;
      return;
    }

    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.08,
    });

    lenisRef.current = lenis;
    isLenisEnabledRef.current = true;

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    const onGsapTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', onLenisScroll);
    gsap.ticker.add(onGsapTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(onGsapTick);
      lenis.destroy();
      lenisRef.current = null;
      isLenisEnabledRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const resetNativeScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      ScrollTrigger.clearScrollMemory?.();
    };

    if (!isLenisEnabledRef.current) {
      resetNativeScroll();

      const raf1 = requestAnimationFrame(() => {
        resetNativeScroll();

        const raf2 = requestAnimationFrame(() => {
          resetNativeScroll();
          ScrollTrigger.refresh();
        });

        return () => cancelAnimationFrame(raf2);
      });

      return () => cancelAnimationFrame(raf1);
    }

    const lenis = lenisRef.current;
    if (!lenis) return;

    const resetLenisScroll = () => {
      lenis.scrollTo(0, { immediate: true });
      resetNativeScroll();
    };

    lenis.stop();
    resetLenisScroll();

    const raf1 = requestAnimationFrame(() => {
      resetLenisScroll();

      const raf2 = requestAnimationFrame(() => {
        resetLenisScroll();
        ScrollTrigger.refresh();
        lenis.start();
      });

      return () => cancelAnimationFrame(raf2);
    });

    return () => cancelAnimationFrame(raf1);
  }, [pathname]);

  return <>{children}</>;
}
