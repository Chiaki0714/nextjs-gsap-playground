'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

type LenisProviderProps = {
  children: React.ReactNode;
};

type DeviceProfile = {
  shouldEnableLenis: boolean;
  prefersReducedMotion: boolean;
};

const getDeviceProfile = (): DeviceProfile => {
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasHover = window.matchMedia('(hover: hover)').matches;

  // 方針:
  // - reduced motion は常に Lenis OFF
  // - coarse pointer かつ hover 不可の端末は Lenis OFF
  //   -> 典型的なスマホ / タブレットを優先的に native scroll に寄せる
  // - 小さいノートPCだけで Lenis が切れる状況は避ける
  const shouldEnableLenis =
    !prefersReducedMotion && !(isCoarsePointer && !hasHover);

  return {
    shouldEnableLenis,
    prefersReducedMotion,
  };
};

export default function LenisProvider({ children }: LenisProviderProps) {
  const pathname = usePathname();

  const lenisRef = useRef<Lenis | null>(null);
  const hasMountedRef = useRef(false);
  const refreshRafRef = useRef<number | null>(null);
  const routeResetCleanupRef = useRef<(() => void) | null>(null);

  const [shouldEnableLenis, setShouldEnableLenis] = useState<boolean>(true);

  const cancelRefreshRaf = () => {
    if (refreshRafRef.current !== null) {
      cancelAnimationFrame(refreshRafRef.current);
      refreshRafRef.current = null;
    }
  };

  const scheduleRefresh = () => {
    cancelRefreshRaf();

    refreshRafRef.current = requestAnimationFrame(() => {
      refreshRafRef.current = null;
      ScrollTrigger.refresh();
    });
  };

  const clearLenis = () => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.destroy();
    lenisRef.current = null;
  };

  const resetNativeScroll = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    ScrollTrigger.clearScrollMemory?.();
  };

  const runAfterFrames = (callback: () => void, frames = 2) => {
    let currentFrame = 0;
    let rafId = 0;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      currentFrame += 1;

      if (currentFrame >= frames) {
        callback();
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  };

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });

    // 同一ページのリロード時はブラウザ標準の復元を尊重する
    window.history.scrollRestoration = 'auto';

    const updateProfile = () => {
      const profile = getDeviceProfile();
      setShouldEnableLenis(profile.shouldEnableLenis);
    };

    updateProfile();

    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(hover: hover)'),
    ];

    mediaQueries.forEach(mediaQuery => {
      mediaQuery.addEventListener('change', updateProfile);
    });

    return () => {
      mediaQueries.forEach(mediaQuery => {
        mediaQuery.removeEventListener('change', updateProfile);
      });
    };
  }, []);

  useEffect(() => {
    cancelRefreshRaf();

    if (!shouldEnableLenis) {
      clearLenis();
      scheduleRefresh();

      return () => {
        cancelRefreshRaf();
      };
    }

    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.08,
    });

    lenisRef.current = lenis;

    const onLenisScroll = () => {
      ScrollTrigger.update();
    };

    const onGsapTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', onLenisScroll);
    gsap.ticker.add(onGsapTick);
    gsap.ticker.lagSmoothing(0);

    scheduleRefresh();

    return () => {
      cancelRefreshRaf();
      lenis.off('scroll', onLenisScroll);
      gsap.ticker.remove(onGsapTick);
      lenis.destroy();

      if (lenisRef.current === lenis) {
        lenisRef.current = null;
      }
    };
  }, [shouldEnableLenis]);

  useLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    routeResetCleanupRef.current?.();
    routeResetCleanupRef.current = null;

    const lenis = lenisRef.current;

    if (!lenis) {
      resetNativeScroll();

      const cleanup = runAfterFrames(() => {
        resetNativeScroll();
        ScrollTrigger.refresh();
      });

      routeResetCleanupRef.current = cleanup;

      return () => {
        cleanup?.();
      };
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

    routeResetCleanupRef.current = cleanup;

    return () => {
      cleanup?.();
      lenis.start();
    };
  }, [pathname]);

  useEffect(() => {
    return () => {
      routeResetCleanupRef.current?.();
      cancelRefreshRaf();
      clearLenis();
    };
  }, []);

  return <>{children}</>;
}
