import type { Metadata } from "next";
import { ABOUT, HOME, STUDIO } from "@/lib/content";
import PageHero from "@/components/sections/PageHero";
import { bySlug } from "@/lib/media.generated";
import Figure from "@/components/primitives/Figure";
import Reveal from "@/components/primitives/Reveal";
import SectionHead from "@/components/primitives/SectionHead";
import Stats from "@/components/sections/Stats";
import PhotoBand from "@/components/sections/PhotoBand";

export const metadata: Metadata = {
  title: "About — Two Generations of Wedding Storytelling",
  description:
    "Three decades of wedding photography in Bengaluru, led by second-generation Creative Director Pavan Sharma. Beyond weddings: cinematography and aerial filming for the Kannada film industry.",
};

/**
 * Each section is a heading column and a content column.
 *
 * The standing frame under each heading takes whatever height the words above
 * it leave, so it runs the full depth of the column — which is what makes it
 * read as part of the section rather than a thumbnail parked beneath a title.
 *
 * A previous pass replaced this with a fixed-height picture row across the
 * full width. That made every frame the same height, but it also made the
 * tall left-hand frame short, which was the one thing about this layout worth
 * keeping.
 */
const TALL = {
  story: bySlug("mandap-wide"),
  beyond: bySlug("bride-red-gold"),
  promise: bySlug("close-whisper"),
};

/** The frame that fills a heading column. */
function TallFrame({ item, alt = "" }: { item: (typeof TALL)["story"]; alt?: string }) {
  return (
    <Reveal delay={0.15} className="min-h-[20rem] flex-1 max-md:hidden">
      <span className="block h-full w-full overflow-hidden bg-paper-deep">
        <img
          src={`/img/${item.slug}-1400.webp`}
          srcSet={item.widths.map((w) => `/img/${item.slug}-${w}.webp ${w}w`).join(", ")}
          sizes="32vw"
          alt={alt}
          aria-hidden={!alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover"
        />
      </span>
    </Reveal>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* A standing frame, not the ceremony wide. The masthead's picture runs
          the full height of the opening screen, which is a tall box — and
          `couple-seated` is a 1.51 landscape that would lose half of itself
          to it. This one is 0.80 against a 0.84 box. */}
      <PageHero
        eyebrow={ABOUT.hero.eyebrow}
        title={ABOUT.hero.title}
        lead={ABOUT.story.lines.join(" ")}
        media="doorway-couple"
        layout="bleed"
      />

      <section className="px-[var(--gutter)] py-[clamp(2.5rem,6vw,5rem)]">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="flex flex-col gap-6 md:col-span-4">
            <SectionHead label={ABOUT.story.label} title={ABOUT.story.title} />
            <TallFrame item={TALL.story} />
          </div>

          <div className="flex flex-col md:col-span-7 md:col-start-6">
            {ABOUT.story.body.map((para, i) => (
              <Reveal key={i} delay={i * 0.08} className="mb-6 last:mb-0">
                <p className="max-w-[58ch] text-[clamp(1rem,1.3vw,1.2rem)] leading-[1.5] text-ink-soft">
                  {para}
                </p>
              </Reveal>
            ))}

            <div className="mt-[clamp(1.5rem,3vw,2.5rem)] grid grid-cols-2 gap-2 sm:gap-3">
              {["red-veil", "banyan-kiss"].map((slug, i) => (
                <Reveal key={slug} delay={0.2 + i * 0.08}>
                  <Figure slug={slug} alt="" ratio="4/5" sizes="(max-width: 768px) 50vw, 28vw" />
                </Reveal>
              ))}
            </div>

            {/* No second column to fill on a phone, so the tall frame rides at
                the foot of the stack rather than being dropped. */}
            <Reveal delay={0.36} className="mt-2 md:hidden">
              <Figure slug={TALL.story.slug} alt="" ratio="16/10" sizes="100vw" />
            </Reveal>
          </div>
        </div>
      </section>

      <Stats />

      <section className="relative bg-ink px-[var(--gutter)] py-[clamp(2.5rem,6vw,5rem)] text-paper">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="flex flex-col gap-6 md:col-span-4">
            <SectionHead label={ABOUT.beyond.label} title={ABOUT.beyond.title} tone="paper" />
            <TallFrame item={TALL.beyond} />
          </div>

          <div className="flex flex-col md:col-span-7 md:col-start-6">
            {ABOUT.beyond.body.map((para, i) => (
              <Reveal key={i} delay={0.1 + i * 0.08} className="mb-6 last:mb-0">
                <p className="max-w-[58ch] leading-[1.5] text-paper/65">{para}</p>
              </Reveal>
            ))}
            <Reveal delay={0.3} className="mt-[clamp(1.5rem,3vw,2.5rem)]">
              <Figure
                slug="stairwell-bw"
                alt="A bride descending a stairwell"
                ratio="16/10"
                sizes="(max-width: 768px) 100vw, 56vw"
              />
            </Reveal>
            <Reveal delay={0.4} className="mt-2 md:hidden">
              <Figure slug={TALL.beyond.slug} alt="" ratio="16/10" sizes="100vw" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Work, where the studio's own slogans used to scroll past at 42px. */}
      <PhotoBand reverse />

      <section className="px-[var(--gutter)] py-[clamp(2.5rem,6vw,5rem)]">
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-12">
          <div className="flex flex-col gap-6 md:col-span-4">
            <SectionHead label={ABOUT.promise.label} title={ABOUT.promise.title} />
            <TallFrame item={TALL.promise} />
          </div>

          <div className="flex flex-col md:col-span-7 md:col-start-6">
            <Reveal>
              <p className="max-w-[58ch] text-[clamp(1rem,1.3vw,1.2rem)] leading-[1.5] text-ink-soft">
                {ABOUT.promise.body}
              </p>
            </Reveal>
            <Reveal
              delay={0.2}
              className="mt-[clamp(1.25rem,2.5vw,2rem)] border-l border-ember/50 pl-6"
            >
              <p className="u-serif text-[clamp(1.15rem,2vw,1.6rem)] text-ink">
                “{HOME.philosophy.text.split(".")[0]}.”
              </p>
              <p className="u-mono mt-3 text-ink-faint">{STUDIO.director} — Creative Director</p>
            </Reveal>
            <Reveal delay={0.3} className="mt-[clamp(1.5rem,3vw,2.5rem)]">
              <Figure
                slug="soft-smile"
                alt="A quiet, close portrait"
                ratio="16/10"
                sizes="(max-width: 768px) 100vw, 56vw"
              />
            </Reveal>
            <Reveal delay={0.4} className="mt-2 md:hidden">
              <Figure slug={TALL.promise.slug} alt="" ratio="16/10" sizes="100vw" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
