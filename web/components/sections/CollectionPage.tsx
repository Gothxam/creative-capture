import Link from "next/link";
import { COLLECTIONS, SERVICES } from "@/lib/content";
import { byCategory, type MediaCategory } from "@/lib/media.generated";
import PageHero from "@/components/sections/PageHero";
import CollectionGrid from "@/components/sections/CollectionGrid";
import SectionHead from "@/components/primitives/SectionHead";
import Reveal from "@/components/primitives/Reveal";

/**
 * Shared shape for /weddings, /pre-wedding and /portraits.
 *
 * Built to match /services: a masthead that opens on a photograph running off
 * the edge, an intro that names itself and sits on the same two columns as
 * everything else, a line of plain facts, then the work.
 *
 * The intro used to be a column of prose starting at column 6 with nothing
 * at all in columns 1 to 4 — a labelled heading block is what that space is
 * for, and without one the section had no way of saying what it was.
 */
export default function CollectionPage({
  category,
  captions,
}: {
  category: MediaCategory;
  captions: readonly string[];
}) {
  const copy = COLLECTIONS[category];
  const frames = byCategory(category);

  // A standing frame for the masthead, which is a tall panel. Sorting for the
  // widest — what this did before — hands a landscape picture to a 0.84 box
  // and loses half of it.
  const opener = [...frames].sort(
    (a, b) => Math.abs(a.ratio - 0.8) - Math.abs(b.ratio - 0.8),
  )[0];

  // The service that sells this collection, so the two pages point at each
  // other rather than being read in isolation.
  const service = SERVICES.find((s) => s.href === `/${category}`);

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={copy.lead}
        media={opener?.slug}
        layout="bleed"
      />

      <section className="px-[var(--gutter)] py-[clamp(2.5rem,6vw,4.5rem)]">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHead label={copy.note} title={copy.noteTitle} />
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {copy.body.map((para, i) => (
              <Reveal key={i} delay={i * 0.08} className="mb-5 last:mb-0">
                <p className="max-w-[56ch] leading-relaxed text-ink-soft">{para}</p>
              </Reveal>
            ))}

            {/* Plain facts, the way the services page sets its deliverables:
                how much work is here, and where to read what it includes. */}
            <Reveal delay={0.2} className="mt-[clamp(1.5rem,3vw,2.25rem)]">
              <dl className="u-mono grid gap-x-8 gap-y-3 border-t border-ink/15 pt-4 sm:grid-cols-2">
                <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
                  <dt className="text-ink-faint">Frames in this collection</dt>
                  <dd className="tabular-nums">{String(frames.length).padStart(2, "0")}</dd>
                </div>
                {service ? (
                  <div className="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
                    <dt className="text-ink-faint">Shot as</dt>
                    <dd className="text-right">{service.title}</dd>
                  </div>
                ) : null}
              </dl>
            </Reveal>

            {service ? (
              <Reveal delay={0.26} className="mt-6">
                <Link
                  href={`/services#${category}`}
                  className="group inline-flex items-center gap-4 border-b border-ink/25 pb-2 transition-colors hover:border-ink"
                >
                  <span className="u-mono">What it includes</span>
                  <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      <CollectionGrid category={category} captions={captions} />
    </>
  );
}
