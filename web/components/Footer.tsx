"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FOOTER, STUDIO } from "@/lib/content";
import Mark from "@/components/primitives/Mark";
import FooterTicker from "@/components/FooterTicker";
import Reveal from "@/components/primitives/Reveal";
import { MaskLines } from "@/components/primitives/MaskText";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Footer() {
  // Read after mount: the current year is not a prerenderable value.
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const root = useRef<HTMLElement>(null);

  // The wordmark used to lie back on a 3D plane and tilt upright as the
  // footer arrived. It went with the 520px lettering it was built for: a
  // scrubbed rotateX on a promoted layer is only worth paying for when the
  // thing rotating is the size of the viewport.

  return (
    // Ink, not flame. A full-bleed orange field was the loudest thing on a
    // site whose whole argument is that the photographs carry the colour —
    // it read as a different brand arriving at the bottom of the page. Ink
    // ties the footer to the other dark sections and lets the wordmark do
    // the shouting instead.
    <footer ref={root} className="relative overflow-hidden bg-ink text-paper">
      <FooterTicker />

      <div className="px-[var(--gutter)] pt-[clamp(2.5rem,5vw,4.5rem)]">
        {/* Grid, not flex-wrap: the headline is wide enough that wrapping
            dropped the links to a second row on the left instead of holding
            them top-right. */}
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-12">
          <Link href="/contact" className="group block md:col-span-8">
            <span className="u-display flex flex-wrap items-baseline gap-x-[0.18em] text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.06]">
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
        {/* The studio's name, said once and quietly.
            It used to run edge-to-edge at up to 520px on a plane that
            tilted upright as you reached it. That was built for a heavy
            display sans; blown up that far, the serif this site now sets
            its headlines in has nothing to hold — the thin strokes break
            down and the whole foot of the page reads as a mistake. It is
            the dot-matrix face at a readable size instead, which is what
            the bar at the top of the page already uses. */}
        <div
          className="flex items-center gap-4 pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(2.5rem,6vw,5rem)]"
        >
          <Mark tone="paper" className="size-14 sm:size-20" />
          <span className="u-wordmark text-[clamp(0.95rem,2.4vw,1.6rem)] text-paper">
            {FOOTER.wordmark.join(" ")}
          </span>
        </div>
      </div>

    </footer>
  );
}
