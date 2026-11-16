"use client";

import Link from "next/link";
import { useRef } from "react";
import { HOME } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import Figure from "@/components/primitives/Figure";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

type Card = { slug: string; title: string; meta: string; span: "tall" | "wide" | "std" };

const CARDS: Card[] = [
  { slug: "mandap-garland", title: "The Mandap", meta: "Bengaluru · Wedding", span: "tall" },
  { slug: "rain-embrace", title: "Monsoon", meta: "Karnataka · Pre-Wedding", span: "wide" },
  { slug: "petals-twirl", title: "Rose Hour", meta: "Studio · Portrait", span: "tall" },
  { slug: "kalash-hands", title: "The Vow", meta: "Temple · Ritual", span: "std" },
  { slug: "backwater-walk", title: "Backwaters", meta: "Kerala · Pre-Wedding", span: "wide" },
  { slug: "mehndi-frame", title: "Mehndi", meta: "Bengaluru · Detail", span: "tall" },
  { slug: "temple-groom", title: "The Temple", meta: "South India · Wedding", span: "std" },
  { slug: "veil-blur", title: "In Motion", meta: "Studio · Portrait", span: "tall" },
  { slug: "couple-seated", title: "The Garlands", meta: "Bengaluru · Wedding", span: "wide" },
];

/**
 * One height for every frame; width falls out of each photograph's own
 * aspect ratio, so the row still has rhythm without the captions landing at
 * nine different heights. The arc supplies the variation that the staggered
 * heights used to.
 */
const FRAME_HEIGHT = "h-[42vh] md:h-[56vh]";

/**
 * Pinned horizontal gallery. The track is translated by exactly the distance
 * it overflows, measured through a function so it re-derives on every resize
 * and refresh rather than baking in a first-paint number.
 *
 * Below `md` the same track becomes a native swipe strip.
 */
export default function HorizontalWork() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const track = el.querySelector<HTMLElement>("[data-track]");
      if (!track) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // The frames ride a circular arc. Each one is placed by where its
        // centre sits across the viewport: it drops along the curve and
        // rotates to stay tangent to it, so the row bows like a strip of
        // film laid over a drum and the centred frame sits highest and
        // squarest. Scale adds just enough depth to say which is nearest.
        //
        // In-plane rotation and translation only — no rotateY, no Z, no
        // perspective chain. The 3D version of this cost roughly half the
        // page's frame budget for a read the curve gives for free.
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);
        const setters = cards.map((card) => ({
          card,
          rot: gsap.quickSetter(card, "rotate", "deg"),
          y: gsap.quickSetter(card, "y", "px"),
          s: gsap.quickSetter(card, "scale"),
        }));

        const shape = () => {
          const mid = window.innerWidth / 2;
          // Radius of the imaginary drum, in px. Larger = flatter arc.
          const R = Math.max(1800, window.innerWidth * 1.7);

          for (const { card, rot, y, s } of setters) {
            const r = card.getBoundingClientRect();
            const dx = r.left + r.width / 2 - mid;
            const angle = gsap.utils.clamp(-0.46, 0.46, dx / R);
            const a = Math.abs(angle);

            y(R * (1 - Math.cos(angle)));
            rot(angle * (180 / Math.PI));
            s(1 - a * 0.16);
          }
        };

        const bar = el.querySelector<HTMLElement>("[data-bar]");
        const count = el.querySelector<HTMLElement>("[data-count]");

        const meta = ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: true,
          onUpdate: (self) => {
            shape();
            if (bar) gsap.set(bar, { scaleX: Math.max(0.02, self.progress) });
            if (count) {
              const n = Math.min(CARDS.length, Math.ceil(self.progress * CARDS.length) || 1);
              count.textContent = String(n).padStart(2, "0");
            }
          },
        });
        shape();

        return () => {
          tween.kill();
          meta.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-paper py-[clamp(3rem,7vw,6rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6 px-[var(--gutter)] pb-[clamp(1.5rem,3vw,2.75rem)]">
        <div>
          <span className="u-mono text-ember">{HOME.work.label}</span>
          <h2 className="u-display mt-3 text-[clamp(2.2rem,7vw,6rem)] leading-[0.88]">
            {HOME.work.title}
          </h2>
        </div>
        <div className="flex items-center gap-5">
          <span className="u-mono text-ink-faint">{HOME.work.note} →</span>
          <span className="u-mono">
            <span data-count>01</span>
            <span className="text-ink-faint"> / {String(CARDS.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>

      <div>
        <div
          data-track
          // Bottom-aligned: the captions sit on one line while the varied
          // card heights stagger along the top edge.
          className="flex w-max items-start gap-[clamp(1.25rem,2.6vw,2.75rem)] px-[var(--gutter)] max-md:w-full max-md:gap-3 max-md:overflow-x-auto max-md:[scrollbar-width:none]"
        >
        {CARDS.map((card, i) => {
          const item = bySlug(card.slug);
          // Each frame keeps its photograph's own proportions, so the widths
          // along the arc vary naturally instead of being forced into three
          // preset shapes.
          const ratio = String(item.ratio);
          return (
            <article key={card.slug} className="shrink-0">
              {/* Only the frame turns. Rotating the whole card moved the
                  caption with it and let a nearer card's image cover the
                  caption of the one beside it. */}
              <div data-card className="relative will-change-transform">
                <Figure
                  slug={card.slug}
                  alt={card.title}
                  ratio={ratio}
                  sizes="(max-width: 768px) 70vw, 30vw"
                  parallax={0}
                  reveal={false}
                  className={`group ${FRAME_HEIGHT}`}
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h3 className="u-display text-[0.95rem] tracking-[-0.01em]">{card.title}</h3>
                <span className="u-mono text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="u-mono mt-1 text-ink-faint">{card.meta}</p>
            </article>
          );
        })}

        <div className="flex shrink-0 w-[60vw] items-center justify-center sm:w-[30vw]">
          <Link
            href="/gallery"
            className="group inline-flex flex-col items-center gap-3 text-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-ink/25 transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
              →
            </span>
            <span className="u-mono">View all work</span>
          </Link>
        </div>
        </div>
      </div>

      <div className="mt-[clamp(1.5rem,3vw,2.5rem)] hidden h-px bg-ink/15 md:mx-[var(--gutter)] md:block">
        <div data-bar className="h-px origin-left scale-x-[0.02] bg-ember" />
      </div>
    </section>
  );
}
