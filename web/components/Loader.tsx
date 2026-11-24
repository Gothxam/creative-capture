"use client";

import { useRef, useState } from "react";
import { STUDIO } from "@/lib/content";
import { markAppReady } from "@/lib/appReady";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { EASE_IO, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

const MIN_MS = 1500; // never flash past — the count has to read as a count
const MAX_MS = 4500; // never hold the page hostage to a slow asset

/**
 * Counting intro: 00 → 100 bottom-left, a rule that fills across the foot of
 * the screen, then the paper splits and lifts away. Scroll stays locked until
 * it clears, and a hard cap guarantees the curtain always rises.
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

      const rule = el.querySelector<HTMLElement>("[data-rule]");
      const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-panel]"));
      const meta = Array.from(el.querySelectorAll<HTMLElement>("[data-meta]"));

      // If the markup ever changes out from under this, let the page through
      // rather than trapping the visitor behind a curtain that can't lift.
      if (!rule || !panels.length) {
        markAppReady();
        setGone(true);
        return;
      }

      stop();

      const value = { n: 0 };
      const started = performance.now();
      let exited = false;

      const exit = () => {
        if (exited) return;
        exited = true;

        const tl = gsap.timeline({
          onComplete: () => {
            markAppReady();
            start();
            setGone(true);
          },
        });
        // The count drops away, then the sheet falls open from the right —
        // columns sliding down rather than lifting, so the paper underneath
        // is revealed from the top edge first.
        tl.to(meta, { yPercent: 40, opacity: 0, duration: 0.45, ease: EASE_IO })
          .to(rule, { scaleX: 0, transformOrigin: "right center", duration: 0.5, ease: EASE_IO }, 0.1)
          .to(
            panels,
            {
              yPercent: 100,
              duration: 1.1,
              ease: EASE_IO,
              stagger: { each: 0.075, from: "end" },
            },
            0.28,
          );
      };

      // The rule along the foot is the only progress shown now, eased so
      // it hesitates near the end like a real load.
      gsap.to(value, {
        n: 100,
        duration: 2.1,
        ease: "power2.inOut",
        onUpdate: () => gsap.set(rule, { scaleX: value.n / 100 }),
      });

      gsap.from(meta, { opacity: 0, y: 12, duration: 0.8, stagger: 0.08, ease: "power2.out" });

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
        gsap.delayedCall(Math.max(0, MIN_MS - waited) / 1000 + 0.45, exit);
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
    <div ref={root} className="fixed inset-0 z-[100] text-paper" aria-hidden>
      {/* Dark sheet, so the reveal plays as house lights coming up on the
          paper underneath. Panels overlap by a pixel so no hairline seam
          shows between them. */}
      <div className="absolute inset-0 flex overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} data-panel className="-mr-px h-full flex-1 bg-ink" />
        ))}
      </div>

      <div className="relative flex h-full flex-col justify-between p-[var(--gutter)]">
        <div className="flex items-start justify-between">
          <span data-meta className="u-mono text-paper/55">
            {STUDIO.name}
          </span>
          <span data-meta className="u-mono text-right text-paper/55">
            {STUDIO.city}
            <br />
            {STUDIO.coords}
          </span>
        </div>

        {/* The curtain, with no percentage on it.
            A counter racing 00 to 100 on every visit is a progress report
            on work the visitor did not ask about, and at 17rem it was the
            largest thing anyone saw of this studio. The wordmark and the
            rule along the foot carry the wait instead. */}
        <div className="flex items-end justify-between gap-6">
          <span data-meta className="u-dot text-[clamp(1.2rem,3.4vw,2.2rem)] leading-none">
            {STUDIO.name}
          </span>
          <span data-meta className="u-mono mb-1 hidden text-right text-paper/50 sm:block">
            Est. {STUDIO.founded}
          </span>
        </div>
      </div>

      <div
        data-rule
        className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-flame"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
