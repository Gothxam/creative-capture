"use client";

import { useRef } from "react";
import { HOME, STUDIO } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The statement, set over a photograph rather than on an empty page.
 *
 * This was a full viewport of type on paper — the single most text-heavy
 * screen on a photography site. The words still fill with light as you
 * scroll, but now they do it across a frame, so the pause between sections
 * is still a picture.
 *
 * The frame has to clear three bars at once, which narrows the library to
 * almost nothing: wide enough not to be destroyed by a 100vw crop, large
 * enough not to be upscaled across it, and free of the studio burned-in
 * corner badge, which collides with type at this size. Of 43 photographs
 * three are wide above 800px, and this is the one whose subject survives
 * being cropped and darkened — hands and marigolds, read as texture.
 *
 * It replaces an 800px social export that was being stretched over the full
 * viewport width.
 */
const FRAME = "ritual-hands";

export default function Philosophy() {
  const root = useRef<HTMLElement>(null);
  const words = HOME.philosophy.text.split(" ");
  const item = bySlug(FRAME);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const spans = gsap.utils.toArray<HTMLElement>("[data-fill]", el);
      if (spans.length) {
        gsap.set(spans, { opacity: 0.22 });
        gsap.to(spans, {
          opacity: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: { trigger: el, start: "top 72%", end: "bottom 78%", scrub: 0.5 },
        });
      }

      const img = el.querySelector<HTMLElement>("[data-parallax]");
      if (img) {
        gsap.fromTo(
          img,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-clip bg-ink">
      <div data-parallax className="absolute inset-0 h-[110%] -top-[5%] will-change-transform">
        <img
          className="media-fill"
          src={`/img/${FRAME}-${item.widths[0]}.webp`}
          srcSet={item.widths.map((w) => `/img/${FRAME}-${w}.webp ${w}w`).join(", ")}
          sizes="100vw"
          alt=""
          aria-hidden
          data-backdrop
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-ink/55" />

      <div className="relative px-[var(--gutter)] py-[clamp(5rem,14vw,11rem)] text-paper">
        <div className="flex flex-wrap items-baseline justify-between gap-4 pb-[clamp(2rem,5vw,3.5rem)]">
          <span className="u-mono text-paper/70">{HOME.philosophy.label}</span>
          <span className="u-mono text-paper/45">{STUDIO.tagline}</span>
        </div>

        <p className="u-display max-w-[30ch] text-[clamp(1.4rem,2.6vw,2.2rem)] leading-[1.1]">
          {words.map((word, i) => (
            <span key={i} data-fill className="inline-block">
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>

        <div className="u-mono mt-[clamp(2.5rem,5vw,4rem)] flex justify-end text-right text-paper/50">
          <div>
            <div className="text-paper/85">{STUDIO.director}</div>
            <div>Creative Director</div>
          </div>
        </div>
      </div>
    </section>
  );
}
