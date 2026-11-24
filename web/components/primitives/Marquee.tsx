"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

/**
 * Seamless infinite ticker.
 *
 * The track holds several identical copies of the items and is translated by
 * exactly one copy's width, so the seam never shows and the loop never
 * drifts. Scroll direction flips the travel direction, which makes the band
 * feel attached to the page rather than looping on its own clock.
 *
 * How many copies is measured, not assumed. It used to be hard-coded at two,
 * which holds only while one copy is at least as wide as the screen — true of
 * a line of text, and false of the photo band, whose eight frames came to
 * 1,210px against a 1,440px viewport. The track would translate by 1,210px
 * and run out, leaving a strip of empty background at the right-hand edge at
 * every window size.
 */
export default function Marquee({
  items,
  speed = 28,
  className = "",
  itemClassName = "px-[0.6em]",
  separator = "✦",
  reverse = false,
}: {
  /** Plain strings, or arbitrary nodes for a composed ticker. */
  items: readonly React.ReactNode[];
  /** Seconds for one full pass. */
  speed?: number;
  className?: string;
  /**
   * Spacing around each item. The default is set in `em` so a type ticker
   * spaces itself against its own size; a band of photographs passes a fixed
   * gap instead, since there is no font size for `em` to refer to.
   */
  itemClassName?: string;
  /** Rendered between items; pass null for none. */
  separator?: React.ReactNode;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);

  // Enough copies that the ones left behind still cover the screen at the
  // moment the track jumps back. Re-measured on resize, and after images
  // inside the band have loaded and given it its real width.
  useEffect(() => {
    const track = ref.current?.querySelector<HTMLElement>("[data-track]");
    const first = track?.firstElementChild as HTMLElement | null;
    if (!first) return;

    const measure = () => {
      const w = first.getBoundingClientRect().width;
      if (!w) return;
      // A sixth of a screen of headroom. Without it the photo band sat 15px
      // inside the margin at some window sizes — and its frames are sized in
      // `vh`, so a shorter window makes every copy narrower and eats whatever
      // slack a tighter formula had left.
      const needed = Math.max(2, Math.ceil((window.innerWidth * 1.15) / w) + 1);
      setCopies((c) => (c === needed ? c : needed));
    };

    measure();
    window.addEventListener("resize", measure);

    // Photographs arrive after first paint and widen the copy as they do.
    const imgs = Array.from(first.querySelectorAll("img"));
    const pending = imgs.filter((img) => !img.complete);
    pending.forEach((img) => img.addEventListener("load", measure, { once: true }));

    return () => {
      window.removeEventListener("resize", measure);
      pending.forEach((img) => img.removeEventListener("load", measure));
    };
  }, [items]);

  useGSAP(
    () => {
      const track = ref.current?.querySelector<HTMLElement>("[data-track]");
      if (!track) return;

      // One copy's share of the whole track.
      const step = 100 / copies;

      // `fromTo`, not `to`. The copy count is measured, so this effect runs a
      // second time once the real width is known — and a plain `to` would
      // have started its loop from wherever the first tween had got to. With
      // two copies that start is -50%, so the band ended up oscillating
      // between -50% and -33% of a three-copy track: it translated further
      // than one copy and pulled its own tail into view, which is the strip
      // of empty background at the right-hand edge.
      const tween = gsap.fromTo(
        track,
        { xPercent: reverse ? -step : 0 },
        { xPercent: reverse ? 0 : -step, ease: "none", duration: speed, repeat: -1 },
      );

      // One shared ScrollTrigger read per frame instead of a private
      // scroll listener per marquee.
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const dir = self.direction;
          tween.timeScale(reverse ? -dir : dir);
        },
      });
      return () => st.kill();
    },
    { scope: ref, dependencies: [speed, reverse, copies] },
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div data-track className="flex w-max items-center whitespace-nowrap will-change-transform">
        {Array.from({ length: copies }, (_, copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy > 0}>
            {items.map((item, i) => (
              <span key={i} className="flex items-center">
                <span className={itemClassName}>{item}</span>
                {separator ? <span className="px-[0.6em] opacity-40">{separator}</span> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
