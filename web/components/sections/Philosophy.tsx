"use client";

import { useRef } from "react";
import { HOME, STUDIO } from "@/lib/content";
import Reveal from "@/components/primitives/Reveal";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A typographic pause between two image-heavy sections.
 *
 * The statement is set across the full measure of the page and fills with
 * ink word by word as it crosses the viewport, so the page reads it to you
 * at the speed you scroll. No photograph here on purpose: it is the one
 * place on the site where the studio speaks rather than shows, and an
 * illustration beside the words only competed with them.
 */
export default function Philosophy() {
  const root = useRef<HTMLElement>(null);
  const words = HOME.philosophy.text.split(" ");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const spans = gsap.utils.toArray<HTMLElement>("[data-fill]", el);
      if (!spans.length) return;

      gsap.set(spans, { opacity: 0.14 });
      gsap.to(spans, {
        opacity: 1,
        ease: "none",
        stagger: 0.5,
        scrollTrigger: {
          trigger: el,
          start: "top 78%",
          end: "bottom 70%",
          scrub: 0.5,
        },
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="border-y border-ink/12 px-[var(--gutter)] py-[clamp(5rem,13vw,11rem)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-[clamp(2rem,5vw,4rem)]">
        <span className="u-mono text-ember">{HOME.philosophy.label}</span>
        <span className="u-mono text-ink-faint">{STUDIO.tagline}</span>
      </div>

      <p className="max-w-[30ch] text-[clamp(1.9rem,5.6vw,4.6rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        {words.map((word, i) => (
          <span key={i} data-fill className="inline-block">
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </p>

      <Reveal delay={0.1} className="mt-[clamp(2.5rem,5vw,4rem)] flex justify-end">
        <div className="u-mono text-right text-ink-faint">
          <div className="text-ink">{STUDIO.director}</div>
          <div>Creative Director</div>
        </div>
      </Reveal>
    </section>
  );
}
