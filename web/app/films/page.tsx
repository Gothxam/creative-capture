import type { Metadata } from "next";
import { FILMS } from "@/lib/content";
import PageHero from "@/components/sections/PageHero";
import FilmStrip from "@/components/sections/FilmStrip";
import Reveal from "@/components/primitives/Reveal";
import SectionHead from "@/components/primitives/SectionHead";
import FilmHero from "@/components/sections/FilmHero";

export const metadata: Metadata = {
  title: "Wedding Cinematography & Films in Bengaluru",
  description:
    "Cinematic wedding films in Bengaluru — teasers, highlights, full films and same-day edits, from a studio with roots in the Kannada film industry.",
};

/** The reel that matches a package name, so each card shows its own film. */
function posterFor(name: string) {
  return FILMS.reels.find((r) => r.kind === name)?.slug;
}

export default function FilmsPage() {
  return (
    <>
      <PageHero
        eyebrow={FILMS.hero.eyebrow}
        title={FILMS.hero.title}
        lead={FILMS.lead}
        media="stairwell-bw"
        layout="bleed"
      />

      <FilmHero />

      <section className="px-[var(--gutter)] py-[clamp(2.5rem,6vw,5rem)]">
        {/* The closing line sits beside the heading rather than alone under
            the grid, so the section opens by saying what it is. */}
        <div className="grid gap-x-10 gap-y-6 pb-[clamp(1.5rem,3vw,2.5rem)] md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionHead label="[ What We Deliver ]" title="Four cuts of the same day" />
          </div>
          <Reveal delay={0.1} className="md:col-span-7 md:col-start-6">
            <p className="u-serif max-w-[56ch] text-[clamp(1.1rem,1.8vw,1.45rem)] leading-snug">
              {FILMS.closing}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-px bg-ink/12 lg:grid-cols-4">
          {FILMS.packages.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 0.07} className="bg-paper">
              <div>
                {/* Each package is one of the reels further down the page, so
                    it can open on that film's own frame. These four cards
                    used to be text alone — four paragraphs about filmmaking
                    with nothing filmed in them. */}
                {posterFor(pkg.name) ? (
                  <span className="block aspect-video w-full overflow-hidden bg-paper-deep">
                    <img
                      src={`/img/${posterFor(pkg.name)}-poster.webp`}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : null}
                <div className="p-[clamp(1.25rem,2.2vw,2rem)]">
                  <span className="u-mono text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="u-display mt-4 text-[clamp(1.2rem,1.9vw,1.6rem)] leading-tight">
                    {pkg.name}
                  </h3>
                  <p className="u-mono mt-2 text-ember">{pkg.length}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FilmStrip limit={4} />
    </>
  );
}
