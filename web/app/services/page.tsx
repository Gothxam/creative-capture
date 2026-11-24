import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/lib/content";
import { byCategory, type MediaCategory } from "@/lib/media.generated";
import PageHero from "@/components/sections/PageHero";
import Figure from "@/components/primitives/Figure";
import Reveal from "@/components/primitives/Reveal";

/**
 * Which collection each service draws its supporting frames from. Films has
 * no stills of its own — the reels are video — so it borrows from the
 * wedding day it documents.
 */
const SOURCE: Record<string, MediaCategory> = {
  weddings: "weddings",
  "pre-wedding": "pre-wedding",
  portraits: "portraits",
  films: "weddings",
};

/** Two more frames from the same collection, skipping the one already shown. */
function companions(slug: string, lead: string) {
  const pool = byCategory(SOURCE[slug] ?? "weddings")
    .filter((m) => m.slug !== lead)
    // The pair below is set in 4/5 boxes, so only frames near that shape
    // belong in it. Landscapes were being halved to fit.
    .filter((m) => m.ratio >= 0.6 && m.ratio <= 0.95);
  // Taken from different ends of the collection so the pair is not two
  // frames from the same part of the same wedding.
  return [pool[2], pool[pool.length - 3]].filter(Boolean);
}

export const metadata: Metadata = {
  title: "Services — Weddings, Pre-Weddings, Portraits & Films",
  description:
    "Luxury wedding photography, creative pre-wedding shoots, portrait sessions and wedding cinematography in Bengaluru. What each collection includes.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="[ Services ]"
        title={["Four Ways", "We Work"]}
        lead="Each has its own pace, its own crew and its own kind of attention. What follows is what you actually get."
        media="haldi-shower"
        layout="bleed"
      />

      {/* The whole range on one screen, before any of it is explained.
          The page used to open straight into service 01 in full, so the only
          way to learn that there were four was to scroll seven thousand
          pixels. Each row jumps to its own block below. */}
      <section className="px-[var(--gutter)] py-[clamp(2rem,5vw,4rem)]">
        <Reveal className="u-mono pb-[clamp(1rem,2vw,1.75rem)] text-ember">[ What We Do ]</Reveal>
        <ul>
          {SERVICES.map((service, i) => (
            <li key={service.slug} className="u-rule">
              <Reveal delay={i * 0.06}>
                <a
                  href={`#${service.slug}`}
                  className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-1 py-[clamp(0.9rem,1.8vw,1.5rem)]"
                >
                  <span className="u-mono col-span-2 text-ink-faint sm:col-span-1">
                    {service.index}
                  </span>
                  <span className="u-display col-span-10 text-[clamp(1.1rem,2vw,1.7rem)] leading-[1.05] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-2 sm:col-span-5">
                    {service.title}
                  </span>
                  <span className="u-serif col-span-10 col-start-3 text-ink-soft sm:col-span-5 sm:col-start-7">
                    {service.subtitle}
                  </span>
                  <span className="hidden text-right sm:col-span-1 sm:block">
                    <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
                      ↓
                    </span>
                  </span>
                </a>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <div className="px-[var(--gutter)] pb-[clamp(3rem,8vw,7rem)]">
        {SERVICES.map((service) => (
          <article
            key={service.slug}
            id={service.slug}
            className="u-rule grid gap-x-10 gap-y-8 scroll-mt-[calc(var(--nav-h)+2rem)] py-[clamp(2.5rem,6vw,5rem)] md:grid-cols-12"
          >
            <div className="md:col-span-5">
              <Reveal className="mb-3 flex items-baseline gap-4">
                <span className="u-mono text-ink-faint">{service.index}</span>
                <span className="u-mono text-ember">{service.subtitle}</span>
              </Reveal>
              <Reveal>
                <h2 className="u-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[1.02]">
                  {service.title}
                </h2>
              </Reveal>
              <Reveal delay={0.1} className="mt-5">
                <p className="max-w-[46ch] leading-relaxed text-ink-soft">{service.summary}</p>
              </Reveal>
              <Reveal delay={0.16} className="mt-4">
                <p className="max-w-[46ch] leading-relaxed text-ink-soft">{service.detail}</p>
              </Reveal>

              {/* The deliverables, at the size of information rather than of
                  a footnote. This list is the most concrete thing on the page
                  — two-photographer teams, hand-finished albums, a 2–3 minute
                  teaser — and it used to be the faintest and smallest, set in
                  grey monospace under two paragraphs of prose. */}
              <Reveal delay={0.22} className="mt-8">
                <span className="u-mono text-ink-faint">What it includes</span>
                <ul className="mt-3 border-t border-ink/15">
                  {service.includes.map((inc) => (
                    <li
                      key={inc}
                      className="flex items-baseline gap-3 border-b border-ink/15 py-[0.6rem]"
                    >
                      <span className="mt-[0.45em] h-px w-3 shrink-0 bg-ember" />
                      <span className="text-[0.98rem]">{inc}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.28} className="mt-7">
                <Link
                  href={service.href}
                  className="group inline-flex items-center gap-4 border-b border-ink/25 pb-2 transition-colors hover:border-ink"
                >
                  <span className="u-mono">See the work</span>
                  <span className="transition-transform duration-500 group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>
              </Reveal>
            </div>

            {/* Three frames, not one. Each service used to carry a single
                photograph beside four paragraphs, so a page about four kinds
                of photography showed four pictures. The extra two are drawn
                from that service's own collection, so the cluster is a
                sample of the work being described rather than decoration. */}
            {/* The cluster sits beside itself rather than stacking.
                Stacked, the lead frame ran its own width tall and the pair
                went underneath, so the picture column reached about 1500px
                against a 700px column of words — eight hundred pixels of
                bare paper down the left of every service. */}
            <div className="order-first md:order-none md:col-span-6 md:col-start-7">
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                <Reveal className="col-span-3">
                  <Figure
                    slug={service.media}
                    alt={service.title}
                    ratio="4/5"
                    sizes="(max-width: 768px) 60vw, 29vw"
                  />
                </Reveal>
                <div className="col-span-2 grid content-start gap-2 sm:gap-3">
                  {companions(service.slug, service.media).map((m, k) => (
                    <Reveal key={m.slug} delay={0.1 + k * 0.08}>
                      <Figure
                        slug={m.slug}
                        alt=""
                        ratio="1/1"
                        sizes="(max-width: 768px) 40vw, 19vw"
                      />
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
