"use client";

import { useRef } from "react";
import { HOME } from "@/lib/content";
import Figure from "@/components/primitives/Figure";
import { bySlug } from "@/lib/media.generated";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

const BEATS = HOME.story.beats;

/**
 * Pinned, scrub-driven storytelling: three beats of a wedding day that
 * cross-fade in place while the page is held still. Below `md` it degrades to
 * a plain stacked sequence — pinning on a phone fights the address bar and
 * buys nothing.
 */
export default function StoryScroll() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const texts = gsap.utils.toArray<HTMLElement>("[data-beat-text]", el);
        const images = gsap.utils.toArray<HTMLElement>("[data-beat-image]", el);
        const bar = el.querySelector<HTMLElement>("[data-progress]");

        // Deliberately flat: a straight cross-fade with a touch of scale.
        // A 3D turn was tried here and read as fussy against the stillness
        // the copy is describing — the quiet is the point.
        gsap.set(texts.slice(1), { opacity: 0, y: 40 });
        gsap.set(images.slice(1), { opacity: 0, scale: 1.08 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: `+=${BEATS.length * 90}%`,
            pin: "[data-pin]",
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        BEATS.forEach((_, i) => {
          if (i === 0) return;
          const at = i - 1;
          tl.to(texts[i - 1], { opacity: 0, y: -40, duration: 0.5, ease: "none" }, at)
            .to(images[i - 1], { opacity: 0, scale: 0.96, duration: 0.5, ease: "none" }, at)
            .to(texts[i], { opacity: 1, y: 0, duration: 0.5, ease: "none" }, at + 0.45)
            .to(images[i], { opacity: 1, scale: 1, duration: 0.5, ease: "none" }, at + 0.45);
        });

        if (bar) {
          gsap.fromTo(
            bar,
            { scaleX: 1 / BEATS.length },
            {
              scaleX: 1,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top top",
                end: `+=${BEATS.length * 90}%`,
                scrub: 0.5,
              },
            },
          );
        }
      });

      // Stacked fallback: each beat simply reveals as it arrives.
      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-beat]", el).forEach((beat) => {
          gsap.fromTo(
            beat,
            { opacity: 0, y: 34 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: EASE,
              scrollTrigger: { trigger: beat, start: "top 82%", once: true },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-ink text-paper">
      <div data-pin className="md:flex md:h-screen md:flex-col md:justify-center">
        <div className="px-[var(--gutter)] py-[clamp(3rem,8vw,0rem)] md:py-0">
          <div className="flex items-baseline justify-between pb-[clamp(1.5rem,3vw,2.5rem)]">
            <span className="u-mono text-ember">{HOME.story.label}</span>
            <span className="u-mono text-paper/40">
              {BEATS.length} chapters
            </span>
          </div>

          {/* Desktop: beats stacked in the same grid cell, cross-fading. */}
          <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-8">
            <div className="relative col-span-3 min-h-[16rem]">
              {BEATS.map((beat) => (
                <div
                  key={beat.index}
                  data-beat-text
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <span className="u-mono text-paper/40">{beat.index}</span>
                  <h3 className="u-display mt-4 text-[clamp(1.3rem,2.2vw,1.9rem)] leading-[1.02]">
                    {beat.title}
                  </h3>
                  <p className="mt-6 max-w-[38ch] text-[1.05rem] leading-relaxed text-paper/65">
                    {beat.body}
                  </p>
                </div>
              ))}
            </div>

            {/* Two frames per beat, not one.
                A whole pinned screen used to carry a single photograph with
                most of the width left empty. Both frames live inside one
                `data-beat-image` wrapper so the cross-fade still indexes one
                element per beat and the timeline above is untouched. */}
            <div className="relative col-span-9 col-start-4 h-[74vh]">
              {BEATS.map((beat) => (
                <div key={beat.index} data-beat-image className="absolute inset-0 flex gap-4">
                  <span className="block h-full flex-[7] overflow-hidden rounded-panel bg-ink-soft/20">
                    <img
                      className="h-full w-full object-cover"
                      src={`/img/${beat.media}-1400.webp`}
                      srcSet={bySlug(beat.media)
                        .widths.map((w) => `/img/${beat.media}-${w}.webp ${w}w`)
                        .join(", ")}
                      sizes="44vw"
                      alt={beat.title}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                    />
                  </span>
                  {/* Shorter and bottom-aligned, so the pair has a step in it
                      rather than reading as two equal panels. */}
                  <span className="flex h-full flex-[4] items-end">
                    <span className="block h-[72%] w-full overflow-hidden rounded-panel bg-ink-soft/20">
                      <img
                        className="h-full w-full object-cover"
                        src={`/img/${beat.detail}-800.webp`}
                        srcSet={bySlug(beat.detail)
                          .widths.map((w) => `/img/${beat.detail}-${w}.webp ${w}w`)
                          .join(", ")}
                        sizes="25vw"
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: the same three beats, stacked.
              The pair sits side by side rather than one above the other. Full
              width each, they filled a screen apiece and the section became
              six scrolls of one photograph. */}
          <div className="space-y-12 md:hidden">
            {BEATS.map((beat) => (
              <article key={beat.index} data-beat>
                <div className="grid grid-cols-5 gap-2">
                  <div className="col-span-3">
                    <Figure slug={beat.media} alt={beat.title} ratio="4/5" sizes="58vw" />
                  </div>
                  <div className="col-span-2 self-end">
                    <Figure slug={beat.detail} alt="" ratio="3/4" sizes="38vw" />
                  </div>
                </div>
                <span className="u-mono mt-6 block text-paper/40">{beat.index}</span>
                <h3 className="u-display mt-3 text-[2rem] leading-[0.95]">{beat.title}</h3>
                <p className="mt-4 text-[1rem] leading-relaxed text-paper/65">{beat.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-[clamp(1.5rem,3vw,2.5rem)] hidden h-px w-full bg-paper/15 md:block">
            <div data-progress className="h-px origin-left bg-ember" />
          </div>
        </div>
      </div>
    </section>
  );
}
