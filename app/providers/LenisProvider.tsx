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

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.08,
    });

    lenisRef.current = lenis;

    const onLenisScroll = () => ScrollTrigger.update();
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
    };
  }, []);

  useLayoutEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.stop();
    lenis.scrollTo(0, { immediate: true });

    ScrollTrigger.clearScrollMemory?.();
    ScrollTrigger.refresh();

    lenis.start();
  }, [pathname]);

  return <>{children}</>;
}
