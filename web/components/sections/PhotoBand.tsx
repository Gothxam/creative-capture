"use client";

import { bySlug } from "@/lib/media.generated";
import Marquee from "@/components/primitives/Marquee";

/**
 * A band of photographs travelling across the page.
 *
 * This slot used to hold a type marquee — "The Lens ✦ Bengaluru · South India
 * ✦ Timeless Moments" at up to 42px, a full-width band of the studio saying
 * its own slogans. On a portfolio the same strip can be doing the one job the
 * site exists for, so it carries work instead: eight photographs crossing the
 * page, which is more photography than the three sections under it managed
 * between them.
 *
 * Each frame keeps its own proportions and they are all shown at one height,
 * so the row has rhythm without any of them being cropped.
 */

const BAND = [
  "haldi-shower",
  "window-silhouette",
  "garland-knot",
  "forehead-rest",
  "bullock-cart",
  "red-saree-hold",
  "temple-vows",
  "creek-embrace",
];

export default function PhotoBand({ reverse = false }: { reverse?: boolean }) {
  const frames = BAND.map((slug) => {
    const item = bySlug(slug);
    return (
      <span
        key={slug}
        className="block h-[clamp(7rem,19vh,11rem)] overflow-hidden"
        style={{ aspectRatio: String(item.ratio) }}
      >
        <img
          src={`/img/${slug}-800.webp`}
          srcSet={item.widths.map((w) => `/img/${slug}-${w}.webp ${w}w`).join(", ")}
          sizes="(max-width: 768px) 46vw, 24vw"
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover"
        />
      </span>
    );
  });

  return (
    <div className="border-y border-ink/12 bg-paper-deep py-3">
      {/* No separator: the gap between frames is the separator, and a glyph
          between photographs reads as debris. */}
      <Marquee items={frames} separator={null} speed={46} itemClassName="px-1.5" reverse={reverse} />
    </div>
  );
}
