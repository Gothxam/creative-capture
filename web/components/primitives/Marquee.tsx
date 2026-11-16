"use client";

import { useRef } from "react";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

/**
 * Seamless infinite ticker. The track is duplicated once and translated by
 * exactly -50%, so the seam never shows and the loop never drifts.
 * Scroll direction flips the travel direction, which makes the band feel
 * attached to the page rather than looping on its own clock.
 */
export default function Marquee({
  items,
  speed = 28,
  className = "",
  separator = "✦",
  reverse = false,
}: {
  /** Plain strings, or arbitrary nodes for a composed ticker. */
  items: readonly React.ReactNode[];
  /** Seconds for one full pass. */
  speed?: number;
  className?: string;
  /** Rendered between items; pass null for none. */
  separator?: React.ReactNode;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = ref.current?.querySelector<HTMLElement>("[data-track]");
      if (!track) return;

      const tween = gsap.to(track, {
        xPercent: reverse ? 0 : -50,
        ease: "none",
        duration: speed,
        repeat: -1,
      });
      if (reverse) gsap.set(track, { xPercent: -50 });

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
    { scope: ref, dependencies: [speed, reverse] },
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <div data-track className="flex w-max items-center whitespace-nowrap will-change-transform">
        {/* Exactly two copies: the track is translated by -50%, so the second
            copy is already in place when the first scrolls out. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span key={i} className="flex items-center">
                <span className="px-[0.6em]">{item}</span>
                {separator ? <span className="px-[0.6em] opacity-40">{separator}</span> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
