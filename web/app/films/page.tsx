import type { Metadata } from "next";
import { FILMS } from "@/lib/content";
import PageHero from "@/components/sections/PageHero";
import FilmStrip from "@/components/sections/FilmStrip";
import Reveal from "@/components/primitives/Reveal";
import FilmHero from "@/components/sections/FilmHero";

export const metadata: Metadata = {
  title: "Wedding Cinematography & Films in Bengaluru",
  description:
    "Cinematic wedding films in Bengaluru — teasers, highlights, full films and same-day edits, from a studio with roots in the Kannada film industry.",
};

export default function FilmsPage() {
  return (
    <>
      <PageHero eyebrow={FILMS.hero.eyebrow} title={FILMS.hero.title} lead={FILMS.lead} />

      <FilmHero />

      <section className="px-[var(--gutter)] py-[clamp(4rem,9vw,8rem)]">
        <Reveal className="pb-[clamp(1.5rem,3vw,2.5rem)]">
          <span className="u-mono text-ember">[ What We Deliver ]</span>
        </Reveal>

        <div className="grid gap-px bg-ink/12 md:grid-cols-2 lg:grid-cols-4">
          {FILMS.packages.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 0.07} className="bg-paper p-[clamp(1.25rem,2.2vw,2rem)]">
              <div>
                <span className="u-mono text-ink-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="u-display mt-5 text-[clamp(1.3rem,2.1vw,1.8rem)] leading-tight">
                  {pkg.name}
                </h3>
                <p className="u-mono mt-2 text-ember">{pkg.length}</p>
                <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">{pkg.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-[clamp(2.5rem,5vw,4rem)] max-w-[60ch]">
          <p className="u-serif text-[clamp(1.15rem,2vw,1.6rem)] leading-snug">
            {FILMS.closing}
          </p>
        </Reveal>
      </section>

      <FilmStrip limit={4} />
    </>
  );
}
