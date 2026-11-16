"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion } from "@/lib/gsap";

type Ctx = { lenis: Lenis | null; stop: () => void; start: () => void };
const SmoothScrollCtx = createContext<Ctx>({ lenis: null, stop: () => {}, start: () => {} });

export const useSmoothScroll = () => useContext(SmoothScrollCtx);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) {
      // No hijacked scrolling, but ScrollTrigger still drives reveals,
      // which the reduced-motion CSS collapses to instant.
      setReady(true);
      return;
    }

    const lenis = new Lenis({
      // lerp rather than duration: the easing is applied per frame against
      // actual elapsed time, so the glide stays consistent whether the
      // display is running at 60Hz or 120Hz, and it reacts to a new wheel
      // event immediately instead of finishing the previous tween first.
      lerp: 0.095,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native momentum on touch feels better than an emulated one.
      syncTouch: false,
    });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setReady(true);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Every route change: top of page, then re-measure once the new DOM paints.
  useEffect(() => {
    if (!ready) return;
    lenisRef.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname, ready]);

  // Fonts land after first paint and change every measured height.
  useEffect(() => {
    if (!ready || !document.fonts) return;
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, [ready]);

  // Lazy images and videos resolve long after the triggers were created, and
  // each one that lands shifts everything below it. Without re-measuring,
  // triggers further down the page fire at the wrong scroll position — or,
  // with `once: true`, never fire at all and leave content stuck hidden.
  useEffect(() => {
    if (!ready) return;
    let timer: number;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    };
    const onLoad = (e: Event) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "IMG" || tag === "VIDEO") refresh();
    };
    // `load` doesn't bubble, so listen in the capture phase.
    document.addEventListener("load", onLoad, true);
    document.addEventListener("loadedmetadata", onLoad, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("load", onLoad, true);
      document.removeEventListener("loadedmetadata", onLoad, true);
    };
  }, [ready]);

  const value: Ctx = {
    lenis: lenisRef.current,
    stop: () => lenisRef.current?.stop(),
    start: () => lenisRef.current?.start(),
  };

  return <SmoothScrollCtx.Provider value={value}>{children}</SmoothScrollCtx.Provider>;
}
