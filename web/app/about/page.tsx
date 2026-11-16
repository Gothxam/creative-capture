import type { Metadata } from "next";
import { ABOUT, HOME, STUDIO } from "@/lib/content";
import PageHero from "@/components/sections/PageHero";
import Figure from "@/components/primitives/Figure";
import Reveal from "@/components/primitives/Reveal";
import Stats from "@/components/sections/Stats";
import Marquee from "@/components/primitives/Marquee";
import { MaskLines } from "@/components/primitives/MaskText";

export const metadata: Metadata = {
  title: "About — Two Generations of Wedding Storytelling",
  description:
    "Three decades of wedding photography in Bengaluru, led by second-generation Creative Director Pavan Sharma. Beyond weddings: cinematography and aerial filming for the Kannada film industry.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={ABOUT.hero.eyebrow}
        title={ABOUT.hero.title}
        lead={ABOUT.story.lines.join(" ")}
      />

      <section className="px-[var(--gutter)] pb-[clamp(3rem,8vw,7rem)]">
        <Figure
          slug="portrait-bw"
          alt="A couple photographed in black and white"
          ratio="21/9"
          sizes="100vw"
          priority
        />
      </section>

      <section className="px-[var(--gutter)] pb-[clamp(4rem,10vw,9rem)]">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <Reveal>
              <span className="u-mono text-ember">{ABOUT.story.label}</span>
            </Reveal>
          </div>
          <div className="md:col-span-8 md:col-start-5">
            {ABOUT.story.body.map((para, i) => (
              <Reveal key={i} delay={i * 0.08} className="mb-6 last:mb-0">
                <p className="max-w-[58ch] text-[clamp(1rem,1.3vw,1.2rem)] leading-relaxed text-ink-soft">
                  {para}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Stats />

      <section className="bg-ink px-[var(--gutter)] py-[clamp(4rem,10vw,9rem)] text-paper">
        <div className="grid gap-x-10 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <span className="u-mono text-ember">{ABOUT.beyond.label}</span>
            <MaskLines
              lines={[ABOUT.beyond.title]}
              className="u-display mt-4 text-[clamp(2rem,5.4vw,4.5rem)] leading-[0.92]"
            />
            {ABOUT.beyond.body.map((para, i) => (
              <Reveal key={i} delay={0.1 + i * 0.08} className="mt-6">
                <p className="max-w-[48ch] leading-relaxed text-paper/65">{para}</p>
              </Reveal>
            ))}
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <Figure
              slug="window-silhouette"
              alt="A silhouette against a bright window"
              ratio="3/4"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>

      <div className="border-b border-ink/12 py-4">
        <Marquee
          items={[STUDIO.tagline, `Est. ${STUDIO.founded}`, "Bengaluru", "South India"]}
          className="u-display text-[clamp(1.4rem,3.4vw,2.6rem)]"
          speed={38}
          reverse
        />
      </div>

      <section className="px-[var(--gutter)] py-[clamp(4rem,10vw,9rem)]">
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Figure
              slug="soft-smile"
              alt="A quiet, close portrait"
              ratio="4/5"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
          <div className="md:col-span-6 md:col-start-7 md:self-center">
            <span className="u-mono text-ember">{ABOUT.promise.label}</span>
            <MaskLines
              lines={[ABOUT.promise.title]}
              className="u-display mt-4 text-[clamp(1.8rem,4.4vw,3.6rem)] leading-[0.95]"
            />
            <Reveal delay={0.15} className="mt-6">
              <p className="max-w-[48ch] text-[1.05rem] leading-relaxed text-ink-soft">
                {ABOUT.promise.body}
              </p>
            </Reveal>
            <Reveal delay={0.25} className="mt-8">
              <p className="u-serif text-[clamp(1.2rem,2.2vw,1.8rem)] text-ink">
                “{HOME.philosophy.text.split(".")[0]}.”
              </p>
              <p className="u-mono mt-3 text-ink-faint">
                {STUDIO.director} — Creative Director
              </p>
            </Reveal>
          </div>
        </div>
      </section>

    </>
  );
}
