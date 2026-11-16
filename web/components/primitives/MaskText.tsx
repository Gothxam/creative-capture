"use client";

import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

/**
 * Raises masked text into view.
 *
 * Both ends set `y: 0` explicitly. The lines are pre-hidden in CSS with
 * `transform: translate3d(0,110%,0)` so nothing flashes before hydration,
 * and GSAP reads that existing transform on init and banks it as a base `y`
 * offset in pixels. Animating `yPercent` alone then runs on top of that base,
 * so the tween finishes back at exactly the offset it started from and the
 * text never appears. Pinning `y` to 0 makes the tween authoritative.
 */
function maskIn(
  spans: NodeListOf<HTMLElement> | HTMLElement[],
  opts: {
    trigger: Element | null;
    duration: number;
    delay: number;
    stagger: number;
    start: string;
    play: "scroll" | "now";
    from: number;
  },
) {
  return gsap.fromTo(
    spans,
    { yPercent: opts.from, y: 0 },
    {
      yPercent: 0,
      y: 0,
      duration: opts.duration,
      delay: opts.delay,
      ease: EASE,
      stagger: opts.stagger,
      immediateRender: false,
      ...(opts.play === "scroll" && opts.trigger
        ? { scrollTrigger: { trigger: opts.trigger, start: opts.start, once: true } }
        : {}),
    },
  );
}

/**
 * Lines rise out of their own clipping box, one after another.
 * Lines are authored explicitly (not measured) so the break points are
 * deliberate and the animation never depends on fragile text measurement.
 */
export function MaskLines({
  lines,
  className,
  lineClassName,
  stagger = 0.08,
  delay = 0,
  duration = 1.15,
  start = "top 82%",
  play = "scroll",
}: {
  lines: readonly string[];
  className?: string;
  lineClassName?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  start?: string;
  /** "scroll" waits for the viewport; "now" plays on mount (hero, after loader). */
  play?: "scroll" | "now";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const spans = el.querySelectorAll<HTMLElement>("[data-mask] > span");
      if (!spans.length) return;
      maskIn(spans, { trigger: el, duration, delay, stagger, start, play, from: 110 });
    },
    { scope: ref, dependencies: [lines.join("|"), play] },
  );

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} data-mask className={`mask-line ${lineClassName ?? ""}`}>
          <span>{line}</span>
        </span>
      ))}
    </div>
  );
}

/**
 * Word-level mask rise — used for the big display headings, where each
 * word carries its own clipping box so wrapping stays clean.
 */
export function MaskWords({
  text,
  className,
  stagger = 0.075,
  delay = 0,
  duration = 1.25,
  start = "top 85%",
  play = "scroll",
}: {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  duration?: number;
  start?: string;
  play?: "scroll" | "now";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const spans = el.querySelectorAll<HTMLElement>("[data-mask] > span");
      if (!spans.length) return;
      maskIn(spans, { trigger: el, duration, delay, stagger, start, play, from: 115 });
    },
    { scope: ref, dependencies: [text, play] },
  );

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} data-mask className="mask-line" style={{ display: "inline-block" }}>
          <span>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}
