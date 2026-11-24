"use client";

import { useRef } from "react";
import { HOME } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * A ceremony frame, read as texture behind the figures rather than as a
 * picture. It has to be one that exists above 1400px, because this band runs
 * the full width of the page; `mandap-wide` was being enlarged to fill it.
 */
const BACKDROP = "couple-seated";

export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      gsap.utils.toArray<HTMLElement>("[data-stat]", el).forEach((stat) => {
        const target = Number(stat.dataset.stat);
        const out = stat.querySelector<HTMLElement>("[data-value]");
        if (!out || !Number.isFinite(target)) return;
        const counter = { n: 0 };

        gsap.to(counter, {
          n: target,
          duration: 2,
          ease: "power3.out",
          onUpdate: () => {
            out.textContent = String(Math.round(counter.n));
          },
          scrollTrigger: { trigger: el, start: "top 78%", once: true },
        });
      });

      gsap.from(gsap.utils.toArray<HTMLElement>("[data-stat]", el), {
        opacity: 0,
        y: 26,
        duration: 1,
        ease: "expo.out",
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
    },
    { scope: root },
  );

  return (
    // Four counting numbers used to sit on bare paper — another band of the
    // page given over entirely to type. The figures are the point, so they
    // stay, but they read over a photograph now and at two thirds the size.
    <section
      ref={root}
      className="relative overflow-clip border-y border-ink/12 px-[var(--gutter)] py-[clamp(2.5rem,5vw,4.5rem)] text-paper"
    >
      <img
        src={`/img/${BACKDROP}-1400.webp`}
        srcSet={bySlug(BACKDROP)
          .widths.map((w) => `/img/${BACKDROP}-${w}.webp ${w}w`)
          .join(", ")}
        sizes="100vw"
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        draggable={false}
        // Marked as a backdrop so the image audit does not report the crop:
        // a band this wide and this short cuts most of any photograph, and
        // that is the point of it rather than a fault in it.
        data-backdrop
        className="media-fill"
      />
      <div className="pointer-events-none absolute inset-0 bg-ink/72" />

      <dl className="relative grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {HOME.stats.map((stat) => (
          <div key={stat.label} data-stat={stat.value}>
            <dd className="u-display text-[clamp(2rem,4.4vw,3.4rem)] leading-none">
              <span data-value>0</span>
              <span className="text-ember">{stat.suffix}</span>
            </dd>
            <dt className="u-mono mt-3 text-paper/60">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
