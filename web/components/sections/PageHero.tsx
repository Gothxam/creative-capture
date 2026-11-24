"use client";

import { STUDIO } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import Reveal from "@/components/primitives/Reveal";
import { MaskLines } from "@/components/primitives/MaskText";

/**
 * Shared masthead for every inner page.
 *
 * The title used to be set in `BleedText`, edge to edge — a single word
 * stretched the full width of the screen, several hundred pixels tall, before
 * any photograph appeared. On nine pages out of nine that was the largest
 * thing on the page, and it is the main reason the site read as typography
 * with pictures attached rather than as a portfolio.
 *
 * Two layouts:
 *
 * `row` is the default — a heading beside a contained photograph, inside the
 * page gutter.
 *
 * `bleed` is for pages that need to feel opened rather than entered partway
 * through. The row layout puts a picture on the right of some text inside the
 * gutter, which is the same shape as every other band further down the page:
 * on /about it sat directly above "Our Story" and "Beyond Weddings", both
 * built the same way, so the top of the page read as its middle. Here the
 * photograph runs the full height of the masthead and off the right edge of
 * the screen, and the section claims most of the first viewport — neither of
 * which any mid-page band does.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  meta,
  media,
  layout = "row",
}: {
  eyebrow: string;
  title: readonly string[];
  lead?: string;
  meta?: string;
  /** Slug of a frame to open the page on; omit for a type-only masthead. */
  media?: string;
  layout?: "row" | "bleed";
}) {
  const item = media ? bySlug(media) : null;

  if (item && layout === "bleed") {
    return (
      // The same twelve columns every section on the page uses.
      //
      // This masthead used to split 56/44 by percentage, which put the
      // photograph's left edge at 1070px on a 1911px screen while every
      // section below started its content at 825px — two vertical lines a
      // couple of hundred pixels apart, running down the page. Columns 1 to 5
      // for the title, 6 to 12 for the picture, matching the heading/content
      // split of the sections underneath exactly.
      <section className="relative overflow-clip px-[var(--gutter)] pt-[calc(var(--nav-h)+clamp(1rem,3vw,2.5rem))] md:min-h-[88svh] md:pt-[var(--nav-h)]">
        <div className="grid gap-x-10 gap-y-0 md:min-h-[inherit] md:grid-cols-12 md:items-stretch">
          <div className="flex flex-col justify-center pb-[clamp(1.5rem,3vw,2.5rem)] md:col-span-5 md:pb-0">
            <Reveal className="mb-[clamp(1rem,2.5vw,2rem)] flex flex-wrap items-baseline justify-between gap-4 md:justify-start md:gap-8">
              <span className="u-mono text-ember">{eyebrow}</span>
              <span className="u-mono text-ink-faint">
                {meta ?? `${STUDIO.city} — ${STUDIO.coords}`}
              </span>
            </Reveal>

            <h1>
              <MaskLines
                lines={title}
                className="u-display text-[clamp(2.2rem,4.6vw,3.8rem)]"
                lineClassName="leading-[0.98]"
              />
            </h1>

            {lead ? (
              <Reveal delay={0.25} className="mt-[clamp(1.25rem,2.2vw,2rem)] max-w-[46ch]">
                <p className="u-serif text-[clamp(1.05rem,1.6vw,1.4rem)] leading-snug text-ink-soft">
                  {lead}
                </p>
              </Reveal>
            ) : null}
          </div>

          {/* Starts on column 6 and runs off the right edge of the screen —
              the negative margin cancels the page gutter. On a phone it takes
              its own standing box below the words, the arrangement the home
              hero settled on: a landscape crop of a standing photograph at
              0.46 keeps almost nothing. */}
          <div // `md:w-auto` matters: with `w-full` the panel has an explicit width,
              // so the negative margin shifts it without widening it and the
              // bleed does nothing. Letting the grid stretch it instead means
              // the margin genuinely adds the gutter back.
              className="relative -mx-[var(--gutter)] aspect-[4/5] w-auto md:col-span-7 md:col-start-6 md:mx-0 md:-mr-[var(--gutter)] md:aspect-auto">
            <img
              src={`/img/${item.slug}-1400.webp`}
              srcSet={item.widths.map((w) => `/img/${item.slug}-${w}.webp ${w}w`).join(", ")}
              sizes="(max-width: 768px) 100vw, 58vw"
              alt=""
              aria-hidden
              fetchPriority="high"
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-[var(--gutter)] pb-[clamp(1.5rem,3.5vw,3rem)] pt-[calc(var(--nav-h)+clamp(1rem,3vw,2.5rem))]">
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-[clamp(0.5rem,1.5vw,1.25rem)]">
        <span className="u-mono text-ember">{eyebrow}</span>
        <span className="u-mono text-ink-faint">{meta ?? `${STUDIO.city} — ${STUDIO.coords}`}</span>
      </div>

      <div className={item ? "grid gap-x-8 gap-y-6 md:grid-cols-12" : undefined}>
        <div className={item ? "md:col-span-5 md:self-end" : undefined}>
          <h1>
            <MaskLines
              lines={title}
              className="u-display text-[clamp(1.9rem,4vw,3.2rem)]"
              lineClassName="leading-[1]"
            />
          </h1>

          {lead ? (
            <Reveal delay={0.25} className="mt-[clamp(1rem,2vw,1.75rem)] max-w-[52ch]">
              <p className="u-serif text-[clamp(1rem,1.5vw,1.3rem)] leading-snug text-ink-soft">
                {lead}
              </p>
            </Reveal>
          ) : null}
        </div>

        {item ? (
          <div className="md:col-span-7">
            <Reveal>
              {/* The box follows the photograph rather than the other way
                  round. A fixed 16/10 opener was cutting 50-58% off the
                  standing frames some pages pass it — and in a library that
                  is five-sixths portrait, that is most of them. Clamped
                  between square and 3:2 so the masthead keeps a consistent
                  shape without ever halving its own picture. */}
              <span
                className="block w-full overflow-hidden bg-paper-deep"
                style={{ aspectRatio: String(Math.min(1.5, Math.max(1, item.ratio))) }}
              >
                <img
                  src={`/img/${item.slug}-1400.webp`}
                  srcSet={item.widths.map((w) => `/img/${item.slug}-${w}.webp ${w}w`).join(", ")}
                  sizes="(max-width: 768px) 100vw, 58vw"
                  alt=""
                  aria-hidden
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              </span>
            </Reveal>
          </div>
        ) : null}
      </div>
    </section>
  );
}
