import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/lib/content";
import PageHero from "@/components/sections/PageHero";
import Figure from "@/components/primitives/Figure";
import Reveal from "@/components/primitives/Reveal";

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
        title={["Services"]}
        lead="Four ways we tell a story — each with its own pace, its own crew and its own kind of attention."
      />

      <div className="px-[var(--gutter)] pb-[clamp(3rem,9vw,8rem)]">
        {SERVICES.map((service, i) => (
          <article
            key={service.slug}
            className="u-rule grid gap-x-10 gap-y-8 py-[clamp(2.5rem,6vw,5rem)] md:grid-cols-12"
          >
            <div className="md:col-span-1">
              <Reveal>
                <span className="u-mono text-ink-faint">{service.index}</span>
              </Reveal>
            </div>

            <div className="md:col-span-5">
              <Reveal>
                <h2 className="u-display text-[clamp(1.7rem,3.6vw,3rem)] leading-[0.96]">
                  {service.title}
                </h2>
              </Reveal>
              <Reveal delay={0.08}>
                <p className="u-serif mt-3 text-[1.2rem] text-ember">{service.subtitle}</p>
              </Reveal>
              <Reveal delay={0.14} className="mt-6">
                <p className="max-w-[46ch] leading-relaxed text-ink-soft">{service.summary}</p>
              </Reveal>
              <Reveal delay={0.2} className="mt-4">
                <p className="max-w-[46ch] leading-relaxed text-ink-soft">{service.detail}</p>
              </Reveal>

              <Reveal delay={0.26} className="mt-8">
                <ul className="u-mono grid gap-2 text-ink-faint sm:grid-cols-2">
                  {service.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2">
                      <span className="h-px w-3 bg-ember" />
                      {inc}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.32} className="mt-9">
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

            <div className={`md:col-span-5 ${i % 2 ? "md:col-start-7" : "md:col-start-8"}`}>
              <Figure
                slug={service.media}
                alt={service.title}
                ratio={i % 2 ? "4/5" : "3/4"}
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </article>
        ))}
      </div>

    </>
  );
}
