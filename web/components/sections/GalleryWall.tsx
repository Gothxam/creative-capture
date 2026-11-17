"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MEDIA, type MediaCategory, type MediaItem } from "@/lib/media.generated";
import Figure from "@/components/primitives/Figure";
import { EASE, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

/**
 * The packed gallery wall.
 *
 * Built after measuring the reference (vivmgmt.com) rather than guessing at
 * it. What that page actually does, probed with `scripts/probe-viv2.mjs`:
 *
 *  - It does not scroll natively at all. `body` is `overflow: hidden` and the
 *    document height equals the viewport height.
 *  - The whole wall is one wrapper translated on X, and that X follows the
 *    **pointer**: cursor at the left edge put it at -41px, cursor at the
 *    right edge at -380px. It leans toward wherever you are.
 *  - Each tile carries its own Y offset on arrival (65px, 56px, 0 …) that
 *    settles to 0 after a couple of seconds — a staggered entrance, not a
 *    scroll effect.
 *
 * Taking native scrolling away from a site whose job is to be read and shared
 * is not a trade worth making, so this keeps the page scrolling normally and
 * puts the same three ideas on top of it:
 *
 *  1. Columns travel at different rates as you scroll, so the wall shears
 *     gently instead of sliding as one block. This is the part that reads as
 *     "the scroll effect".
 *  2. The whole wall leans horizontally toward the pointer, as the reference
 *     does — a few px, eased, and only where there is a real cursor.
 *  3. Columns rise into place on arrival, staggered.
 *
 * Columns are explicit elements rather than CSS `columns` because each one
 * has to be transformed independently — and transforming five columns is far
 * cheaper than transforming every photograph in them.
 */

/** Per-column scroll travel, as a fraction of the distance scrolled. */
const DRIFT = [0.06, -0.1, 0.03, -0.13, 0.08];

/** Column count by viewport. Five columns on a phone is ~70px per picture. */
const BREAKPOINTS: [query: string, columns: number][] = [
  ["(min-width: 1440px)", 5],
  ["(min-width: 1024px)", 4],
  ["(min-width: 640px)", 3],
];

function useColumnCount(max: number) {
  const [count, setCount] = useState(max);

  useEffect(() => {
    const lists = BREAKPOINTS.map(([q]) => window.matchMedia(q));
    const pick = () => {
      const hit = BREAKPOINTS.findIndex((_, i) => lists[i].matches);
      setCount(Math.min(max, hit === -1 ? 2 : BREAKPOINTS[hit][1]));
    };
    pick();
    lists.forEach((l) => l.addEventListener("change", pick));
    return () => lists.forEach((l) => l.removeEventListener("change", pick));
  }, [max]);

  return count;
}

function distribute(items: MediaItem[], columns: number): MediaItem[][] {
  const cols: MediaItem[][] = Array.from({ length: columns }, () => []);
  // Track each column's accumulated height for a unit width, so the columns
  // come out roughly level however the aspect ratios fall.
  const heights = new Array(columns).fill(0);
  for (const item of items) {
    const shortest = heights.indexOf(Math.min(...heights));
    cols[shortest].push(item);
    heights[shortest] += 1 / (item.ratio || 1);
  }
  return cols;
}

export default function GalleryWall({
  filter,
  maxColumns = 5,
}: {
  filter: MediaCategory | "all";
  maxColumns?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const columns = useColumnCount(maxColumns);

  const items = useMemo(
    () => (filter === "all" ? MEDIA : MEDIA.filter((m) => m.category === filter)),
    [filter],
  );
  const cols = useMemo(() => distribute([...items], columns), [items, columns]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const columnEls = gsap.utils.toArray<HTMLElement>("[data-col]", el);
      if (!columnEls.length) return;

      const mm = gsap.matchMedia();

      // Entrance: columns rise in, staggered.
      gsap.fromTo(
        columnEls,
        { yPercent: 6, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.1,
          ease: EASE,
          stagger: 0.07,
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );

      mm.add("(min-width: 768px)", () => {
        // 1. Differential travel per column.
        const drifts = columnEls.map((col, i) => {
          const rate = DRIFT[i % DRIFT.length];
          return gsap.to(col, {
            y: () => window.innerHeight * rate,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });
        });

        // 2. The whole wall leans toward the pointer.
        let lean: ((v: number) => void) | null = null;
        const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (fine) {
          lean = gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            const t = e.clientX / window.innerWidth - 0.5; // -0.5 … 0.5
            lean!(t * -46);
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          return () => {
            window.removeEventListener("pointermove", onMove);
            drifts.forEach((d) => d.kill());
          };
        }

        return () => drifts.forEach((d) => d.kill());
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [filter, columns] },
  );

  // Re-measure once the new set has laid out: column heights just changed.
  useGSAP(
    () => {
      const id = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(id);
    },
    { dependencies: [filter] },
  );

  return (
    <div ref={root} className="flex gap-1.5 will-change-transform">
      {cols.map((col, c) => (
        // No `will-change` here on purpose: a column is narrow but thousands
        // of pixels tall, and permanently promoting five of those holds five
        // enormous textures for a transform that only moves a few dozen px.
        // Measured marginally faster without it.
        <div key={c} data-col className="flex min-w-0 flex-1 flex-col gap-1.5">
          {col.map((item) => (
            <figure key={item.slug} className="group relative">
              <Figure
                slug={item.slug}
                alt={item.slug.replace(/-/g, " ")}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                parallax={0}
                reveal={false}
              />
              <figcaption className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-ink/75 via-ink/10 to-transparent p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="u-mono capitalize text-paper">
                  {item.slug.replace(/-/g, " ")}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      ))}
    </div>
  );
}
