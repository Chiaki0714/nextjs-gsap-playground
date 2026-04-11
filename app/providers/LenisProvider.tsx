'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import 'lenis/dist/lenis.css';

import { MEDIA_QUERIES } from '../lib/media-queries';

gsap.registerPlugin(ScrollTrigger);

type LenisProviderProps = Readonly<{
  children: React.ReactNode;
}>;

type DeviceProfile = {
  shouldEnableLenis: boolean;
};

const getDeviceProfile = (): DeviceProfile => {
  const prefersReducedMotion = window.matchMedia(
    MEDIA_QUERIES.reducedMotion,
  ).matches;
  const isCoarsePointer = window.matchMedia(
    MEDIA_QUERIES.pointerCoarse,
  ).matches;
  const hasHover = window.matchMedia(MEDIA_QUERIES.hoverFine).matches;

  return {
    shouldEnableLenis: !prefersReducedMotion && !(isCoarsePointer && !hasHover),
  };
};

const addMediaQueryListener = (
  mediaQueryList: MediaQueryList,
  listener: () => void,
) => {
  mediaQueryList.addEventListener('change', listener);

  return () => {
    mediaQueryList.removeEventListener('change', listener);
  };
};

export default function LenisProvider({ children }: LenisProviderProps) {
  const pathname = usePathname();

  const lenisRef = useRef<Lenis | null>(null);
  const hasMountedRef = useRef(false);
  const refreshRafRef = useRef<number | null>(null);
  const routeResetCleanupRef = useRef<(() => void) | null>(null);

  const [shouldEnableLenis, setShouldEnableLenis] = useState(true);

  const cancelRefreshRaf = () => {
    if (refreshRafRef.current === null) return;

    cancelAnimationFrame(refreshRafRef.current);
    refreshRafRef.current = null;
  };

  const scheduleRefresh = () => {
    cancelRefreshRaf();

    refreshRafRef.current = requestAnimationFrame(() => {
      refreshRafRef.current = null;
      ScrollTrigger.refresh();
    });
  };

  const destroyLenis = () => {
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
    window.history.scrollRestoration = 'auto';

    const updateProfile = () => {
      setShouldEnableLenis(getDeviceProfile().shouldEnableLenis);
    };

    updateProfile();

    const mediaQueries = [
      window.matchMedia(MEDIA_QUERIES.reducedMotion),
      window.matchMedia(MEDIA_QUERIES.pointerCoarse),
      window.matchMedia(MEDIA_QUERIES.hoverFine),
    ];

    const cleanups = mediaQueries.map(mediaQuery =>
      addMediaQueryListener(mediaQuery, updateProfile),
    );

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, []);

  useEffect(() => {
    cancelRefreshRaf();

    if (!shouldEnableLenis) {
      destroyLenis();
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

    const handleLenisScroll = () => {
      ScrollTrigger.update();
    };

    const handleGsapTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', handleLenisScroll);
    gsap.ticker.add(handleGsapTick);
    gsap.ticker.lagSmoothing(0);

    scheduleRefresh();

    return () => {
      cancelRefreshRaf();
      lenis.off('scroll', handleLenisScroll);
      gsap.ticker.remove(handleGsapTick);
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
      destroyLenis();
    };
  }, []);

  return children;
}
