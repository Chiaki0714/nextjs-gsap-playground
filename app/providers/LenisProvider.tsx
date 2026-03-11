// app/providers/LenisProvider.tsx
'use client';

import { useEffect, useRef } from 'react';
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

    // Lenis新規作成
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.08,
    });

    // RefにLenisを格納し再利用可能にする
    lenisRef.current = lenis;

    if (typeof window !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      ScrollTrigger.update();
    };
    const handleTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    // GSAPと連携
    lenis.on('scroll', handleScroll);
    // 毎フレームlenis.raf(t)を呼んでスクロール結果の位置を計算、反映
    gsap.ticker.add(handleTick);
    // 重い時の追いつき補正を切って安定化
    gsap.ticker.lagSmoothing(0);

    return () => {
      // クリーンアップ
      lenis.off('scroll', handleScroll);
      gsap.ticker.remove(handleTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    lenis.stop();
    lenis.scrollTo(0, { immediate: true });
    // window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      lenis.start();
    });
  }, [pathname]);

  return <>{children}</>;
}
