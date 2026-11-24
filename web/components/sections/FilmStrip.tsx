"use client";

import Link from "next/link";
import { useRef } from "react";
import { FILMS } from "@/lib/content";
import Reveal from "@/components/primitives/Reveal";
import Tilt from "@/components/primitives/Tilt";
import { MaskWords } from "@/components/primitives/MaskText";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Film cards that only start playing while they're actually on screen —
 * four simultaneous video decodes is how a page like this drops frames.
 */
export default function FilmStrip({ limit = 3 }: { limit?: number }) {
  const root = useRef<HTMLElement>(null);
  const reels = FILMS.reels.slice(0, limit);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      gsap.utils.toArray<HTMLElement>("[data-reel]", el).forEach((card) => {
        const video = card.querySelector("video");
        if (!video) return;

        gsap.to({}, {
          scrollTrigger: {
            trigger: card,
            start: "top 92%",
            end: "bottom 8%",
            onEnter: () => void video.play().catch(() => {}),
            onEnterBack: () => void video.play().catch(() => {}),
            onLeave: () => video.pause(),
            onLeaveBack: () => video.pause(),
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-ink px-[var(--gutter)] py-[clamp(4rem,10vw,9rem)] text-paper">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-[clamp(1.5rem,3vw,3rem)]">
        <div>
          <span className="u-mono text-ember">[ Films ]</span>
          <MaskWords
            text="Stories that move"
            // Down from 88px. The films underneath are the section.
            className="u-display mt-3 block text-[clamp(1.5rem,3vw,2.6rem)] leading-[1]"
          />
        </div>
        <Link
          href="/films"
          className="group inline-flex items-center gap-3 border-b border-paper/30 pb-2 transition-colors hover:border-paper"
        >
          <span className="u-mono">All films</span>
          <span className="transition-transform duration-500 group-hover:translate-x-1.5">→</span>
        </Link>
      </div>

      <Reveal stagger={0.12} className="grid gap-6 md:grid-cols-3">
        {reels.map((reel) => (
          <article key={reel.slug} data-reel className="group">
            <Tilt max={7} lift={30}>
              <div
                className="relative aspect-[4/5] overflow-hidden bg-paper/5"
                style={{ transformStyle: "preserve-3d" }}
              >
                <video
                  className="media-fill transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                  src={`/video/${reel.slug}.mp4`}
                  poster={`/img/${reel.slug}-poster.webp`}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-60" />
                {/* Pushed forward in Z so it floats above the frame as it tilts. */}
                <span
                  className="u-mono absolute left-4 top-4 border border-paper/30 px-2.5 py-1 text-paper"
                  style={{ transform: "translateZ(42px)" }}
                >
                  {reel.kind}
                </span>
              </div>
            </Tilt>
            <h3 className="u-display mt-4 text-[1.15rem]">{reel.title}</h3>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
