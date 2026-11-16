"use client";

import { STUDIO } from "@/lib/content";
import { useAppReady } from "@/lib/appReady";
import BleedText from "@/components/primitives/BleedText";
import Reveal from "@/components/primitives/Reveal";

/**
 * Shared masthead for every inner page: a monospace tag, the page title set
 * edge to edge, and an optional lead paragraph.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  meta,
}: {
  eyebrow: string;
  title: readonly string[];
  lead?: string;
  meta?: string;
}) {
  // Inner pages are reached by client navigation, where the loader has
  // already gone — but a hard refresh lands behind it, so wait either way.
  const ready = useAppReady();

  return (
    <section className="px-[var(--gutter)] pb-[clamp(2rem,5vw,4rem)] pt-[calc(var(--nav-h)+clamp(1.5rem,5vw,4rem))]">
      <div className="flex flex-wrap items-baseline justify-between gap-4 pb-[clamp(0.5rem,1.5vw,1.25rem)]">
        <span className="u-mono text-ember">{eyebrow}</span>
        <span className="u-mono text-ink-faint">{meta ?? `${STUDIO.city} — ${STUDIO.coords}`}</span>
      </div>

      <h1>
        {title.map((line, i) => (
          <BleedText key={line} play={ready ? "now" : "none"} delay={i * 0.1}>
            {line}
          </BleedText>
        ))}
      </h1>

      {lead ? (
        <Reveal delay={0.35} className="mt-[clamp(1.5rem,3vw,2.5rem)] max-w-[58ch]">
          <p className="u-serif text-[clamp(1.1rem,2vw,1.75rem)] leading-snug text-ink-soft">
            {lead}
          </p>
        </Reveal>
      ) : null}
    </section>
  );
}
