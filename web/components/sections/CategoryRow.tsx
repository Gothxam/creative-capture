import Link from "next/link";
import { SERVICES } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import Reveal from "@/components/primitives/Reveal";

/**
 * The four collections as a row of square cards, under a centred heading.
 *
 * This is the reference's "shop by category" block, measured off it: square
 * cards at a 1/1 ratio, an 8px radius, an 8px gutter between them, a faint
 * grey well behind each photograph, and the label set below the card rather
 * than over it. The heading is centred and sits on its own line — the only
 * centred heading on the page, which is what makes it read as an index
 * rather than as another section of prose.
 *
 * It goes high on the page on purpose. Everything above it is atmosphere;
 * this is the first thing that tells a visitor what can actually be booked,
 * and on the reference it arrives within one screen of the hero.
 */
export default function CategoryRow() {
  return (
    <section className="px-[var(--gutter)] py-[clamp(3rem,7vw,6rem)]">
      <Reveal className="pb-[clamp(1.75rem,3.5vw,3rem)] text-center">
        <h2 className="u-display mx-auto max-w-[18ch] text-[clamp(1.7rem,3.2vw,3rem)] leading-[1.02]">
          Find your collection
        </h2>
      </Reveal>

      {/* An 8px gutter, not a generous one. The reference sets these cards
          almost touching, so the row reads as a single control strip. */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {SERVICES.map((service, i) => {
          const item = bySlug(service.media);
          return (
            <Reveal key={service.slug} delay={i * 0.06}>
              <Link href={service.href} className="group block">
                <span className="block overflow-hidden rounded-panel bg-paper-dim">
                  <span className="block aspect-square w-full overflow-hidden">
                    <img
                      src={`/img/${service.media}-800.webp`}
                      srcSet={item.widths
                        .map((w) => `/img/${service.media}-${w}.webp ${w}w`)
                        .join(", ")}
                      sizes="(max-width: 1024px) 48vw, 23vw"
                      alt={service.title}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
                    />
                  </span>
                </span>

                {/* Label under the card, not over the photograph.
                    Title first, subtitle second: the subtitles run from
                    three words to eight, so with the subtitle on top the
                    titles sat on three different baselines across one row. */}
                <span className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="u-serif text-[clamp(1rem,1.5vw,1.25rem)] leading-tight transition-colors duration-500 group-hover:text-ember">
                    {service.title}
                  </span>
                  <span className="u-mono shrink-0 text-ink-faint tabular-nums">
                    {service.index}
                  </span>
                </span>
                <span className="u-mono mt-1.5 block text-ink-faint">{service.subtitle}</span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
