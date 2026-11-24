"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ScrollTrigger, gsap, prefersReducedMotion } from "@/lib/gsap";

type Ctx = { lenis: Lenis | null; stop: () => void; start: () => void };
const SmoothScrollCtx = createContext<Ctx>({ lenis: null, stop: () => {}, start: () => {} });

export const useSmoothScroll = () => useContext(SmoothScrollCtx);

/** The element the current URL's hash names, if it is on this page. */
function hashTarget() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return id ? document.getElementById(id) : null;
}

/**
 * Where the page should sit for an anchor to read as the top of its section.
 *
 * Lenis scrolls to a number, so it never sees `scroll-margin-top` — without
 * reading it back the nav would cover the first line of whatever was linked.
 */
function anchorY(el: HTMLElement) {
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  return Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin);
}

/** Put both the native position and Lenis's own at y, with no animation. */
function jumpTo(lenis: Lenis | null, y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true });
  else window.scrollTo(0, y);
}

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
  //
  // Unless the URL names an anchor. `/services#portraits` used to land at the
  // top of the services page like any other visit, because this effect runs
  // after the browser's own hash jump and overrode it — so the "What it
  // includes" link on each collection page went to the right page and the
  // wrong place on it.
  useEffect(() => {
    if (!ready) return;

    const target = hashTarget();
    if (!target) {
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
    }

    // Lazy images above the target land over the next second or so and push
    // it down, so one jump is not enough — hold the alignment until the
    // position it reports stops moving.
    let frame = 0;
    let settled = 0;
    let tries = 0;
    let last = -1;
    const hold = () => {
      const y = anchorY(target);
      if (Math.abs(y - last) < 2) settled += 1;
      else settled = 0;
      last = y;
      jumpTo(lenisRef.current, y);
      // Capped: a page that never stops moving must not hold the reader in
      // place, and must not keep an rAF loop alive for the whole visit.
      if (settled < 8 && ++tries < 180) frame = requestAnimationFrame(hold);
      else ScrollTrigger.refresh();
    };
    frame = requestAnimationFrame(hold);
    return () => cancelAnimationFrame(frame);
  }, [pathname, ready]);

  // Anchors inside the page the reader is already on — the index at the top
  // of /services. A bare href jumps natively, which skips past the easing and
  // leaves Lenis to catch up from wherever the browser dropped it.
  useEffect(() => {
    if (!ready) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link || link.target === "_blank") return;

      const href = link.getAttribute("href") ?? "";
      if (!href.startsWith("#") || href === "#") return;

      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (!target) return;

      e.preventDefault();
      history.pushState(null, "", href);
      const y = anchorY(target);
      if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.1 });
      else window.scrollTo({ top: y, behavior: "smooth" });
    };

    const onHashChange = () => {
      const target = hashTarget();
      if (target) jumpTo(lenisRef.current, anchorY(target));
    };

    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [ready]);

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
