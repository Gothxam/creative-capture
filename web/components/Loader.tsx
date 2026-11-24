"use client";

import { useRef, useState } from "react";
import { markAppReady } from "@/lib/appReady";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { EASE_IO, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const MIN_MS = 700; // long enough to read as a reveal, not a flicker
const MAX_MS = 3000; // never hold the page hostage to a slow asset

/**
 * The reveal, and nothing else.
 *
 * Four dark columns slide away from the right, uncovering the page from the
 * top edge down. Scroll stays locked until they clear, and a hard cap
 * guarantees they always do.
 *
 * There is no screen in front of them any more — no counter, no wordmark, no
 * coordinates, no rule filling across the foot. All of that was a loading
 * screen pretending the site was heavier than it is, and it delayed the
 * first thing anyone came for. What is left is the transition itself, which
 * is the part worth keeping: the page is simply uncovered.
 *
 * The minimum hold dropped with it, from 1500ms to 700ms. The old floor
 * existed so a counter had time to count; nothing needs that time now.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const { stop, start } = useSmoothScroll();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (prefersReducedMotion()) {
        markAppReady();
        setGone(true);
        return;
      }

      const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-panel]"));

      // If the markup ever changes out from under this, let the page through
      // rather than trapping the visitor behind a curtain that can't lift.
      if (!panels.length) {
        markAppReady();
        setGone(true);
        return;
      }

      stop();

      const started = performance.now();
      let exited = false;

      const exit = () => {
        if (exited) return;
        exited = true;

        gsap.to(panels, {
          yPercent: 100,
          duration: 1,
          ease: EASE_IO,
          stagger: { each: 0.07, from: "end" },
          // The hero is told to begin when the curtain has finished, so its
          // entrance is something you watch rather than something that has
          // already happened.
          //
          // This was briefly moved to `onStart`, on the theory that
          // overlapping the two would read as one movement. It did the
          // opposite: the whole entrance played behind the panels, so by
          // the time they cleared everything had settled and there was no
          // animation left to see. The jump that made overlapping look
          // necessary was a separate bug — the hero's elements painted
          // before they animated — and that is fixed where it belongs, in
          // the markup.
          onComplete: () => {
            markAppReady();
            start();
            setGone(true);
          },
        });
      };

      // Leave when the real work is done, bounded on both sides.
      const assetsReady = Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>((res) =>
          document.readyState === "complete"
            ? res()
            : window.addEventListener("load", () => res(), { once: true }),
        ),
      ]);

      assetsReady.then(() => {
        const waited = performance.now() - started;
        gsap.delayedCall(Math.max(0, MIN_MS - waited) / 1000, exit);
      });
      gsap.delayedCall(MAX_MS / 1000, exit);

      return () => {
        start();
      };
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[100]" aria-hidden>
      {/* Paper, not ink.
          The home page opens on a black hero, so black panels sliding off
          it revealed nothing — the reveal was invisible on the one screen
          most people see first. Light columns peeling away to show the dark
          hero is the whole move.

          The right edge of each column is ruled, so the columns still read
          as separate on the paper pages, where the panels and the page
          underneath are the same colour. The last one has no rule: it would
          sit on the screen edge. */}
      <div className="absolute inset-0 flex overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            data-panel
            className={`h-full flex-1 bg-paper ${i < 3 ? "border-r border-ink/[0.07]" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
