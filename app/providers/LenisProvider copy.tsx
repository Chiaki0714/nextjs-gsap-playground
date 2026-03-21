'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

type LenisProviderProps = {
  children: React.ReactNode;
};

export default function LenisProvider({ children }: LenisProviderProps) {
  const pathname = usePathname();

  const lenisRef = useRef<Lenis | null>(null);
  const isLenisEnabledRef = useRef(false);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    // 同一ページのリロード時はブラウザ標準の復元を尊重したいので auto にする。
    // ページ遷移時の先頭リセットは下の useLayoutEffect([pathname]) 側で制御する。
    window.history.scrollRestoration = 'auto';

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const isSmallViewport = window.matchMedia('(max-width: 1024px)').matches;
    const shouldDisableLenis = isCoarsePointer || isSmallViewport;

    if (shouldDisableLenis) {
      isLenisEnabledRef.current = false;

      // ネイティブスクロール時も初回描画後に計測だけ整える。
      const rafId = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });

      return () => {
        cancelAnimationFrame(rafId);
      };
    }

    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.08,
    });

    lenisRef.current = lenis;
    isLenisEnabledRef.current = true;

    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };

    const handleGsapTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', handleLenisScroll);
    gsap.ticker.add(handleGsapTick);
    gsap.ticker.lagSmoothing(0);

    // 初回表示ではリロード復元位置を壊さず、計測だけ整える。
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', handleLenisScroll);
      gsap.ticker.remove(handleGsapTick);
      lenis.destroy();

      lenisRef.current = null;
      isLenisEnabledRef.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    // 初回表示ではブラウザの scroll restoration を優先する。
    // ここで reset すると、同一ページのリロード復元を壊してしまう。
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const resetNativeScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      ScrollTrigger.clearScrollMemory?.();
    };

    const runAfterFrames = (callback: () => void, frames = 2) => {
      let frameCount = 0;
      let rafId = 0;

      const tick = () => {
        frameCount += 1;

        if (frameCount >= frames) {
          callback();
          return;
        }

        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(rafId);
      };
    };

    const resetWithRefresh = () => {
      resetNativeScroll();

      return runAfterFrames(() => {
        resetNativeScroll();
        ScrollTrigger.refresh();
      });
    };

    if (!isLenisEnabledRef.current) {
      return resetWithRefresh();
    }

    const lenis = lenisRef.current;
    if (!lenis) {
      return resetWithRefresh();
    }

    const resetLenisScroll = () => {
      lenis.scrollTo(0, { immediate: true });
      resetNativeScroll();
    };

    lenis.stop();
    resetLenisScroll();

    const cleanup = runAfterFrames(() => {
      resetLenisScroll();
      ScrollTrigger.refresh();
      lenis.start();
    });

    return () => {
      cleanup?.();
      lenis.start();
    };
  }, [pathname]);

  return <>{children}</>;
}
