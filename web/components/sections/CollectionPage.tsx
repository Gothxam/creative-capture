import { COLLECTIONS } from "@/lib/content";
import type { MediaCategory } from "@/lib/media.generated";
import PageHero from "@/components/sections/PageHero";
import CollectionGrid from "@/components/sections/CollectionGrid";
import Reveal from "@/components/primitives/Reveal";

/** Shared shape for /weddings, /pre-wedding and /portraits. */
export default function CollectionPage({
  category,
  captions,
}: {
  category: MediaCategory;
  captions: readonly string[];
}) {
  const copy = COLLECTIONS[category];

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />

      <section className="px-[var(--gutter)] pb-[clamp(2rem,5vw,4rem)]">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-6">
            {copy.body.map((para, i) => (
              <Reveal key={i} delay={i * 0.08} className="mb-5 last:mb-0">
                <p className="max-w-[56ch] leading-relaxed text-ink-soft">{para}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CollectionGrid category={category} captions={captions} />

    </>
  );
}
