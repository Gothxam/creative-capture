"use client";

import { useCallback, useEffect, useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

/**
 * A line of display type that is measured and then sized to span its
 * container exactly, edge to edge, at any viewport width.
 *
 * Font size is derived from a real measurement rather than a `vw` guess, so
 * it stays flush whatever the font actually metrics out to — and re-derives
 * on resize and after webfonts swap in.
 */
export default function BleedText({
  children,
  className = "",
  /** Fraction of the container width to fill. */
  fill = 1,
  /** Cap so a short word doesn't become absurdly tall on wide screens. */
  maxPx = 460,
  mask = true,
  play = "scroll",
  delay = 0,
}: {
  children: string;
  className?: string;
  fill?: number;
  maxPx?: number;
  mask?: boolean;
  play?: "scroll" | "now" | "none";
  delay?: number;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const inner = useRef<HTMLSpanElement>(null);

  const fit = useCallback(() => {
    const box = wrap.current;
    const text = inner.current;
    if (!box || !text) return;

    const available = box.clientWidth;
    if (!available) return;

    // Measure at a known size, then scale the result. The inner span is
    // inline-block so it shrink-wraps to the glyphs — a block-level span
    // would just report the container's width back.
    //
    // offsetWidth, not getBoundingClientRect(): the rect is the *visual* box
    // and folds in every ancestor transform, so inside the footer's tilted,
    // scaled 3D stage the text measured smaller than it really was and the
    // computed size overshot the container. offsetWidth is layout-space and
    // ignores transforms.
    text.style.fontSize = "100px";
    const measured = text.offsetWidth;
    if (!measured) return;

    const size = Math.min(maxPx, (available / measured) * 100 * fill);
    text.style.fontSize = `${size}px`;
  }, [fill, maxPx]);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(fit);
    if (wrap.current) ro.observe(wrap.current);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [fit, children]);

  useGSAP(
    () => {
      if (!mask || play === "none") return;
      const text = inner.current;
      if (!text) return;

      gsap.fromTo(
        text,
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 1.35,
          delay,
          ease: EASE,
          immediateRender: false,
          ...(play === "scroll"
            ? { scrollTrigger: { trigger: wrap.current, start: "top 90%", once: true } }
            : {}),
        },
      );
    },
    { scope: wrap, dependencies: [children, play, mask] },
  );

  return (
    <span ref={wrap} className={`block overflow-hidden ${className}`}>
      <span
        ref={inner}
        className="u-display inline-block whitespace-nowrap align-top leading-[0.82] will-change-transform"
      >
        {children}
      </span>
    </span>
  );
}
