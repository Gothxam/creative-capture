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

/**
 * The slot shapes are pitched at the library rather than at an ideal one.
 * Of 43 photographs 34 stand taller than they are wide and only three are
 * meaningfully landscape, so the two slots that used to ask for 16/10 and
 * 3/2 could almost never be filled honestly — whatever landed in them lost
 * half its frame to the crop. They now ask for 5/4 and 4/3, which the square
 * and near-square pictures reach without being cut.
 */
const RHYTHM: Slot[] = [
  { span: "md:col-span-7", offset: "", ratio: "4/5", tilt: -1.1 },
  { span: "md:col-span-4 md:col-start-9", offset: "md:mt-[11%]", ratio: "3/4", tilt: 1.4, print: true },
  { span: "md:col-span-3 md:col-start-2", offset: "md:-mt-[16%]", ratio: "1/1", tilt: -2, print: true },
  { span: "md:col-span-6 md:col-start-6", offset: "md:mt-[2%]", ratio: "5/4", tilt: 0.8 },
  { span: "md:col-span-4 md:col-start-2", offset: "md:mt-[4%]", ratio: "3/4", tilt: 1.6 },
  { span: "md:col-span-5 md:col-start-7", offset: "md:-mt-[12%]", ratio: "4/5", tilt: -1.3 },
  { span: "md:col-span-3 md:col-start-3", offset: "md:-mt-[10%]", ratio: "1/1", tilt: 2.2, print: true },
  // Starts at column 6, clear of the slot above it. Overlapping its
  // neighbour pushed it onto a row of its own and left a screen-sized hole.
  { span: "md:col-span-7 md:col-start-6", offset: "md:mt-[1%]", ratio: "4/3", tilt: -0.7 },
];

/**
 * Deal the photographs into the rhythm by shape instead of in order.
 *
 * The collage gives each position a fixed crop box, which is what gives the
 * page its rhythm — but dealing pictures into it in file order is blind, and
 * it was putting standing portraits into the landscape slots and cutting
 * nearly two thirds off them. Each slot now takes whichever of the remaining
 * photographs is closest to its shape.
 *
 * Distance is measured on the log of the ratio so that a picture twice too
 * wide and a picture twice too tall are equally wrong; compared plainly, the
 * tall one always looks closer and the landscape slots fill with portraits
 * all over again.
 */
/** Roughly what a slot paints at on a 1440 grid, less gutters. */
function slotWidth(span: string) {
  const cols = Number(span.match(/col-span-(\d+)/)?.[1] ?? 12);
  return (cols / 12) * 1320;
}

/** The largest file that exists for a photograph. `widths` is descending. */
function fileWidth(item: { widths: readonly number[] }) {
  return item.widths[0] ?? 0;
}

/** Past this much crop a slot gives up its shape and takes the picture's own. */
const CROP_CEILING = Math.log(1.55);

function dealByShape<T extends { ratio: number; widths: readonly number[] }>(
  list: readonly T[],
  rhythm: Slot[],
) {
  // One slot per photograph, cycling the rhythm.
  const slots = list.map((_, n) => rhythm[n % rhythm.length]);

  const cost = (item: T, slot: Slot) => {
    const [w, h] = slot.ratio.split("/").map(Number);
    const shape = Math.abs(Math.log(item.ratio / (w / h)));
    // A second term, so the big slots are not handed the small files. The
    // library runs from 2200px down to a single 420px frame, and dealing on
    // shape alone put that one across half the page.
    const short = Math.max(0, Math.log(slotWidth(slot.span) / fileWidth(item)));
    return shape + short * 1.3;
  };

  // Assign over every pairing at once, cheapest first, rather than walking the
  // slots in order and giving each the best picture still unclaimed. Walking
  // in order spends the good matches early and leaves the last photograph
  // with whatever slot nobody took — which is how a 420px frame ended up
  // across half of /portraits, simply by being last in the list.
  const pairs: { s: number; p: number; c: number }[] = [];
  slots.forEach((slot, s) => list.forEach((item, p) => pairs.push({ s, p, c: cost(item, slot) })));
  pairs.sort((a, b) => a.c - b.c);

  const takenSlot = new Set<number>();
  const takenPhoto = new Set<number>();
  const bySlot: { item: T; index: number; slot: Slot }[] = [];

  for (const { s, p } of pairs) {
    if (takenSlot.has(s) || takenPhoto.has(p)) continue;
    takenSlot.add(s);
    takenPhoto.add(p);

    const slot = slots[s];
    const [w, h] = slot.ratio.split("/").map(Number);
    const item = list[p];

    // Some pools have nothing of the right shape at all — /portraits holds no
    // landscape pictures, so its widest slot would always be cutting a
    // standing frame in half. When the closest match is still this far out,
    // the slot keeps its position in the collage and takes the photograph's
    // own proportions instead of forcing the crop.
    const miss = Math.abs(Math.log(item.ratio / (w / h)));
    const fitted =
      miss > CROP_CEILING
        ? { ...slot, ratio: `${Math.round(item.ratio * 1000)}/1000` }
        : slot;

    bySlot[s] = { item, index: p, slot: fitted };
  }

  return bySlot.filter(Boolean);
}

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
    <section className="overflow-clip px-[var(--gutter)] py-[clamp(1.5rem,3vw,3rem)]">
      <div

        className="grid grid-cols-2 gap-x-2 gap-y-2 sm:gap-x-5 sm:gap-y-[clamp(1rem,2.2vw,2rem)] md:grid-cols-12"
      >
        {dealByShape(list, RHYTHM).map(({ item, index: i, slot }, n) => {
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
                  {String(n + 1).padStart(2, "0")}
                </span>
              </div>
              <figcaption className="u-mono mt-3 flex items-baseline justify-between gap-3 text-ink-faint">
                <span className="capitalize">{labelFor(item, i)}</span>
                <span>{String(n + 1).padStart(2, "0")}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
