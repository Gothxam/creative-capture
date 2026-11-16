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

      const counter = el.querySelector<HTMLElement>("[data-count]");
      const rule = el.querySelector<HTMLElement>("[data-rule]");
      const panels = Array.from(el.querySelectorAll<HTMLElement>("[data-panel]"));
      const meta = Array.from(el.querySelectorAll<HTMLElement>("[data-meta]"));

      // If the markup ever changes out from under this, let the page through
      // rather than trapping the visitor behind a curtain that can't lift.
      if (!counter || !rule || !panels.length) {
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
        tl.to([counter, ...meta], { yPercent: 40, opacity: 0, duration: 0.45, ease: EASE_IO })
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

      // The count itself: eased so it hesitates near the end like a real load.
      gsap.to(value, {
        n: 100,
        duration: 2.1,
        ease: "power2.inOut",
        onUpdate: () => {
          const n = Math.round(value.n);
          counter.textContent = n === 100 ? "100" : String(n).padStart(2, "0");
          gsap.set(rule, { scaleX: value.n / 100 });
        },
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

        <div className="flex items-end justify-between gap-6">
          <span className="flex items-baseline">
            <span
              data-count
              className="u-display block text-paper"
              style={{ fontSize: "clamp(5rem, 19vw, 17rem)", lineHeight: 0.76 }}
            >
              00
            </span>
            <span
              data-meta
              className="u-display ml-[0.08em] text-flame"
              style={{ fontSize: "clamp(1.4rem, 4vw, 3.2rem)", lineHeight: 1 }}
            >
              %
            </span>
          </span>
          <span data-meta className="u-mono mb-2 hidden text-right text-paper/55 sm:block">
            Est. {STUDIO.founded}
            <br />
            Loading the archive
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
