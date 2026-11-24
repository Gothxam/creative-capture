"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FOOTER, STUDIO } from "@/lib/content";
import DotField from "@/components/primitives/DotField";
import FooterTicker from "@/components/FooterTicker";
import BleedText from "@/components/primitives/BleedText";
import Reveal from "@/components/primitives/Reveal";
import { MaskLines } from "@/components/primitives/MaskText";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Footer() {
  // Read after mount: the current year is not a prerenderable value.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const root = useRef<HTMLElement>(null);

  // The wordmark lies back on a plane and tilts upright as the footer
  // arrives — the strongest 3D moment on the page, and cheap: one scrubbed
  // transform on one element.
  useGSAP(
    () => {
      const stage = root.current?.querySelector<HTMLElement>("[data-stage]");
      if (!stage) return;

      // rotateX + y only, no scale: scaling forces the browser to
      // re-rasterize the wordmark — a very large glyph texture — on every
      // scrubbed frame, which showed up as the last cluster of long frames
      // on the page. A promoted layer rotating in place costs nothing.
      gsap.fromTo(
        stage,
        { rotateX: 26, y: 44 },
        {
          rotateX: 0,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
            end: "bottom bottom",
            scrub: 0.5,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    // Ink, not flame. A full-bleed orange field was the loudest thing on a
    // site whose whole argument is that the photographs carry the colour —
    // it read as a different brand arriving at the bottom of the page. Ink
    // ties the footer to the other dark sections and lets the wordmark do
    // the shouting instead.
    <footer ref={root} className="relative overflow-hidden bg-ink text-paper">
      <DotField />
      <FooterTicker />

      <div className="px-[var(--gutter)] pt-[clamp(2.5rem,5vw,4.5rem)]">
        {/* Grid, not flex-wrap: the headline is wide enough that wrapping
            dropped the links to a second row on the left instead of holding
            them top-right. */}
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-12">
          <Link href="/contact" className="group block md:col-span-8">
            <span className="u-display flex flex-wrap items-baseline gap-x-[0.18em] text-[clamp(2rem,5.6vw,4.6rem)] leading-[0.88]">
              <MaskLines lines={[FOOTER.cta[0]]} className="basis-full" />
              <MaskLines lines={[FOOTER.cta[1]]} />
              <span className="inline-block transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-2 group-hover:translate-x-2">
                ↗
              </span>
            </span>
          </Link>

          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-9 gap-y-3 pt-2 md:col-span-4 md:justify-end"
          >
            {FOOTER.links.map((l) => (
              <Link key={l.href} href={l.href} className="u-mono group relative py-1">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-paper transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
        </div>

        <Reveal
          stagger={0.06}
          className="mt-[clamp(1.75rem,3.5vw,3rem)] grid gap-x-8 gap-y-5 border-t border-paper/20 pt-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <h3 className="u-mono opacity-55">Email</h3>
            <a href={`mailto:${STUDIO.email}`} className="u-mono mt-1 block break-all hover:underline">
              {STUDIO.email}
            </a>
          </div>
          <div>
            <h3 className="u-mono opacity-55">Phone</h3>
            <a href={`tel:${STUDIO.phoneHref}`} className="u-mono mt-1 block hover:underline">
              {STUDIO.phone}
            </a>
          </div>
          <div className="lg:col-span-2">
            <h3 className="u-mono opacity-55">Studio</h3>
            <address className="u-mono mt-1 not-italic leading-[1.6]">
              {STUDIO.address} — {STUDIO.coords}
            </address>
          </div>
        </Reveal>
      </div>

      {/* Sits above the wordmark rather than over it: the letterforms are
          paper now, and anything laid on top of them had no colour that read
          against both them and the ink around them. */}
      <div className="px-[var(--gutter)] pt-4 text-right">
        <span className="u-mono text-paper/45">© {year ?? STUDIO.founded}</span>
      </div>

      {/* Wordmark: set edge to edge and cropped by the bottom of the page,
          on a tilted plane. `perspective` lives on the parent so the child's
          rotation reads as depth rather than a flat skew. */}
      <div
        className="mt-[clamp(1rem,2vw,2rem)] px-[var(--gutter)]"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 0%" }}
      >
        {/* Promoted to its own layer: without it, rotating a plane carrying
            two viewport-wide glyph runs repaints them on every frame. */}
        <div
          data-stage
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "50% 100%",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          {FOOTER.wordmark.map((word, i) => (
            <BleedText
              key={word}
              fill={1}
              maxPx={520}
              className={i === FOOTER.wordmark.length - 1 ? "-mb-[0.17em]" : "-mb-[0.04em]"}
            >
              {word}
            </BleedText>
          ))}
        </div>
      </div>

    </footer>
  );
}
