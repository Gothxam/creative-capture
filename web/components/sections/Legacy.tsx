"use client";

import Link from "next/link";
import { HOME } from "@/lib/content";
import Figure from "@/components/primitives/Figure";
import Reveal from "@/components/primitives/Reveal";
import { MaskLines } from "@/components/primitives/MaskText";

export default function Legacy() {
  return (
    <section className="px-[var(--gutter)] py-[clamp(4rem,11vw,10rem)]">
      <div className="grid gap-x-10 gap-y-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <Reveal>
            <span className="u-mono text-ember">{HOME.legacy.label}</span>
          </Reveal>
          <Reveal delay={0.1} className="mt-10 hidden md:block">
            <Figure
              slug="stairwell-bw"
              alt="A bride on a stairwell, photographed in black and white"
              ratio="3/4"
              sizes="(max-width: 768px) 100vw, 22vw"
            />
          </Reveal>
        </div>

        <div className="md:col-span-8 md:col-start-5">
          <MaskLines
            lines={HOME.legacy.lines}
            className="u-display text-[clamp(1.6rem,4.3vw,3.9rem)]"
            lineClassName="leading-[1.04]"
          />
          <Reveal delay={0.2} className="mt-9 max-w-[52ch]">
            <p className="text-[clamp(1rem,1.25vw,1.15rem)] leading-relaxed text-ink-soft">
              {HOME.legacy.body}
            </p>
          </Reveal>
          <Reveal delay={0.3} className="mt-10">
            <Link
              href="/about"
              className="group inline-flex items-center gap-4 border-b border-ink/25 pb-2 transition-colors hover:border-ink"
            >
              <span className="u-mono">Our story</span>
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
