"use client";

import { byCategory, type MediaCategory, type MediaItem } from "@/lib/media.generated";
import Figure from "@/components/primitives/Figure";

/**
 * Editorial collage rather than a grid of equal cards.
 *
 * Frames alternate between full-bleed spreads, portrait columns, square
 * details and small insets that overlap the frame above them, so a screenful
 * holds several pictures at different scales and the eye has somewhere to go.
 * Each slot also carries a hand-placed rotation of a degree or two, pulled
 * slightly further as the page scrolls past.
 */

type Slot = {
  span: string;
  offset: string;
  ratio: string;
  /** Resting rotation in degrees. */
  tilt: number;
  /** Width of the paper border, if the frame is "printed". */
  print?: boolean;
};

const RHYTHM: Slot[] = [
  { span: "md:col-span-7", offset: "", ratio: "4/5", tilt: -1.1 },
  { span: "md:col-span-4 md:col-start-9", offset: "md:mt-[22%]", ratio: "3/4", tilt: 1.4, print: true },
  { span: "md:col-span-3 md:col-start-2", offset: "md:-mt-[14%]", ratio: "1/1", tilt: -2, print: true },
  { span: "md:col-span-6 md:col-start-6", offset: "md:mt-[6%]", ratio: "16/10", tilt: 0.8 },
  { span: "md:col-span-4 md:col-start-2", offset: "md:mt-[10%]", ratio: "3/4", tilt: 1.6 },
  { span: "md:col-span-5 md:col-start-7", offset: "md:-mt-[8%]", ratio: "4/5", tilt: -1.3 },
  { span: "md:col-span-3 md:col-start-3", offset: "md:-mt-[6%]", ratio: "1/1", tilt: 2.2, print: true },
  // Starts at column 6, clear of the slot above it. Overlapping its
  // neighbour pushed it onto a row of its own and left a screen-sized hole.
  { span: "md:col-span-7 md:col-start-6", offset: "md:mt-[4%]", ratio: "3/2", tilt: -0.7 },
];

export default function CollectionGrid({
  category,
  items,
  captions,
}: {
  category?: MediaCategory;
  items?: MediaItem[];
  /** Parallel to the resolved list; falls back to a de-slugged filename. */
  captions?: readonly string[];
}) {

  const list = items ?? (category ? byCategory(category) : []);
  const labelFor = (item: MediaItem, i: number) =>
    captions?.[i] ?? item.slug.replace(/-/g, " ");

  // The hand-placed tilt is a static CSS transform, not a scrubbed tween.
  // Animating rotation on every frame of a page this image-dense meant
  // re-rasterising each photograph (and its paper shadow) on every scrolled
  // frame, and it dominated the page's frame budget for an effect nobody
  // could see moving.

  return (
    <section className="overflow-clip px-[var(--gutter)] py-[clamp(2rem,6vw,5rem)]">
      <div

        className="grid grid-cols-1 gap-x-5 gap-y-[clamp(2.5rem,5vw,4rem)] md:grid-cols-12"
      >
        {list.map((item, i) => {
          const slot = RHYTHM[i % RHYTHM.length];
          return (
            <figure key={item.slug} className={`${slot.span} ${slot.offset}`}>
              <div
                data-frame
                // Only the small printed frames are tilted. A rotation on the
                // large bleed images forced the browser to re-rasterise each
                // photograph on every scrolled frame and held the page at
                // 30fps; dropping it there took the same page to a locked 60.
                // Promoting them to their own layers instead was worse again.
                style={slot.print ? { transform: `rotate(${slot.tilt}deg)` } : undefined}
                className={`group relative ${
                  slot.print ? "bg-paper p-[0.55rem] shadow-[0_18px_34px_-26px_rgba(17,16,16,0.55)]" : ""
                }`}
              >
                <Figure
                  slug={item.slug}
                  alt={labelFor(item, i)}
                  ratio={slot.ratio}
                  sizes="(max-width: 768px) 100vw, 45vw"
                  parallax={0}
                />
                <span className="u-mono pointer-events-none absolute right-3 top-3 bg-paper/85 px-2 py-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <figcaption className="u-mono mt-3 flex items-baseline justify-between gap-3 text-ink-faint">
                <span className="capitalize">{labelFor(item, i)}</span>
                <span>{String(i + 1).padStart(2, "0")}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
