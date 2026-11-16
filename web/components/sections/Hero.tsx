"use client";

import { useRef } from "react";
import { HOME, STUDIO } from "@/lib/content";
import { useAppReady } from "@/lib/appReady";
import BleedText from "@/components/primitives/BleedText";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const ready = useAppReady();

  useGSAP(
    () => {
      if (!ready) return;
      const el = root.current;
      if (!el) return;

      const rise = Array.from(el.querySelectorAll<HTMLElement>("[data-rise]"));
      const frame = el.querySelector<HTMLElement>("[data-frame]");
      const video = el.querySelector<HTMLVideoElement>("video");

      // Entrance, once the curtain is up. The headline runs its own mask
      // reveal (BleedText, play="now"); this handles everything around it.
      const tl = gsap.timeline();
      tl.fromTo(
        rise,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.09 },
        0.45,
      );
      if (frame) {
        tl.fromTo(
          frame,
          { clipPath: "inset(42% 22% 0% 22%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: EASE },
          0.25,
        );
      }

      video?.play().catch(() => {
        /* autoplay blocked — the poster still carries the frame */
      });

      // Scroll: the frame grows past full width while the title drifts up.
      if (frame) {
        gsap.to(frame, {
          scale: 1.12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        });
      }
      gsap.to("[data-title]", {
        yPercent: -38,
        opacity: 0.25,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom 30%", scrub: true },
      });
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    // overflow-clip: the frame scales past its box on scroll and would
    // otherwise widen the document.
    <section
      ref={root}
      className="relative overflow-clip px-[var(--gutter)] pb-[clamp(2rem,5vw,5rem)] pt-[calc(var(--nav-h)+clamp(1rem,4vw,3rem))]"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 pb-[clamp(0.75rem,2vw,1.5rem)]">
        <span data-rise className="u-mono text-ember">
          [ {HOME.hero.eyebrow} ]
        </span>
        <span data-rise className="u-mono text-ink-faint">
          Est. {STUDIO.founded} — {STUDIO.city}
        </span>
      </div>

      <h1 data-title>
        {HOME.hero.title.map((word, i) => (
          <BleedText key={word} play="now" delay={0.1 + i * 0.1}>
            {word}
          </BleedText>
        ))}
      </h1>

      <div
        data-frame
        className="relative mt-[clamp(1.25rem,3vw,2.5rem)] aspect-[16/10] w-full overflow-hidden bg-ink will-change-transform md:aspect-[21/9]"
      >
        <video
          className="media-fill"
          src="/video/film-ceremony.mp4"
          poster="/img/film-ceremony-poster.webp"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-label="Wedding film still"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/15" />

        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-6 p-[clamp(1rem,2.5vw,2.5rem)]">
          <p data-rise className="u-serif max-w-[34ch] text-[clamp(1.05rem,1.9vw,1.6rem)] leading-snug text-paper">
            {HOME.hero.lead}
          </p>
          <div data-rise className="u-mono space-y-1 text-right text-paper/70">
            {HOME.hero.meta.map((m) => (
              <div key={m}>{m}</div>
            ))}
          </div>
        </div>
      </div>

      <div data-rise className="mt-5 flex items-center justify-between">
        <span className="u-mono text-ink-faint">Scroll to begin</span>
        <span className="u-mono text-ink-faint">{STUDIO.coords}</span>
      </div>
    </section>
  );
}
