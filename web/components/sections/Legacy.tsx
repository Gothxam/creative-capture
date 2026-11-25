"use client";

import Link from "next/link";
import { HOME } from "@/lib/content";
import Figure from "@/components/primitives/Figure";
import Reveal from "@/components/primitives/Reveal";
import { bySlug } from "@/lib/media.generated";

/**
 * Three photographs and a paragraph.
 *
 * This was one picture beside eight lines of display type — a sentence about
 * being among the finest wedding photographers in Bengaluru, set at 40px and
 * running down most of the screen. On a studio's own site that argument is
 * better made by the work than by the size of the claim, so the claim is now
 * read at reading size and the space it was taking holds two more frames.
 *
 * The three are a deliberate spread — a temple, a ritual close-up and a
 * couple outdoors — so the section shows the range the paragraph describes
 * instead of asserting it.
 */
/** The frame that fills the copy column. */
const LEDGER = bySlug("henna-ring");

export default function Legacy() {
  return (
    <section className="px-[var(--gutter)] py-[clamp(3rem,8vw,7rem)]">
      <div className="grid gap-x-5 gap-y-5 md:grid-cols-12">
        {/* The standing frame leads. */}
        <div className="md:col-span-5">
          <Reveal>
            <Figure
              slug="temple-groom"
              alt="A groom waiting on the steps of a temple"
              ratio="4/5"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </Reveal>
        </div>

        <div className="grid content-start gap-5 md:col-span-4">
          <Reveal>
            <Figure
              slug="ritual-hands"
              alt="Hands and marigolds during a ritual"
              ratio="3/2"
              sizes="(max-width: 768px) 100vw, 32vw"
            />
          </Reveal>
          <Reveal delay={0.12}>
            <Figure
              slug="rocks-seated"
              alt="A couple seated on rocks above a river"
              ratio="4/5"
              sizes="(max-width: 768px) 100vw, 32vw"
            />
          </Reveal>
        </div>

        {/* A fourth frame above the copy.
            The three photographs on the left run the full height of the row
            while the paragraph beside them is short, so bottom-aligning the
            text left most of this column as bare paper — a hole roughly the
            size of one of the pictures. The frame fills it and the section
            carries four photographs instead of three. */}
        <div className="flex flex-col gap-6 md:col-span-3">
          {/* This frame takes whatever height the copy underneath does not.
              Given a fixed shape it left a hole the size of a picture at the
              top of the column, because the three frames beside it run much
              taller than a paragraph does. */}
          <Reveal className="min-h-[14rem] flex-1">
            <span className="block h-full w-full overflow-hidden bg-paper-deep">
              <img
                src={`/img/${LEDGER.slug}-800.webp`}
                srcSet={LEDGER.widths.map((w) => `/img/${LEDGER.slug}-${w}.webp ${w}w`).join(", ")}
                sizes="(max-width: 768px) 100vw, 24vw"
                alt="Henna-covered hands during the ceremony"
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </span>
          </Reveal>
          <Reveal className="-mb-1">
            <span className="u-mono text-ember">{HOME.legacy.label}</span>
          </Reveal>
          {/* Reading size. The same sentence used to run at 40px. */}
          <Reveal>
            <p className="u-display text-[clamp(1.2rem,1.9vw,1.6rem)] leading-[1.25]">
              {HOME.legacy.lines.join(" ")}
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-5">
            <p className="text-[0.95rem] leading-[1.5] text-ink-soft">{HOME.legacy.body}</p>
          </Reveal>
          <Reveal delay={0.25} className="mt-7">
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
