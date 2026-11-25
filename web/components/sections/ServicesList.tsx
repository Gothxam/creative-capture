"use client";

import Link from "next/link";
import { SERVICES } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import Reveal from "@/components/primitives/Reveal";

/**
 * Four photographs that happen to be links.
 *
 * This was a list: four rows of display type at up to 50px with a thumbnail
 * in the margin and a preview card that followed the pointer. The preview
 * was the only place the work appeared at any size, which meant the section
 * showed nothing at all on a touch screen and read as a contents page
 * everywhere else.
 *
 * Now each service is a standing frame with its name across the foot of it.
 * Same four links, same copy, four large photographs instead of four
 * headlines — and nothing that depends on a pointer being present.
 */
export default function ServicesList() {
  return (
    <section className="px-[var(--gutter)] py-[clamp(3rem,8vw,7rem)]">
      <Reveal className="flex items-baseline justify-between pb-[clamp(1.25rem,2.5vw,2.25rem)]">
        <span className="u-mono text-ember">[ What We Do ]</span>
        <span className="u-mono text-ink-faint">
          {String(SERVICES.length).padStart(2, "0")} services
        </span>
      </Reveal>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">
        {SERVICES.map((service, i) => {
          const item = bySlug(service.media);
          return (
            <li key={service.slug}>
              <Reveal delay={i * 0.08}>
                <Link href={service.href} className="group block">
                  <span className="relative block aspect-[3/4] w-full overflow-hidden bg-paper-deep">
                    <img
                      src={`/img/${item.slug}-800.webp`}
                      srcSet={item.widths
                        .map((w) => `/img/${item.slug}-${w}.webp ${w}w`)
                        .join(", ")}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      alt={service.title}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
                    />
                    {/* A scrim only at the foot, where the name sits. */}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-paper">
                      <span className="u-display text-[clamp(1.05rem,1.5vw,1.35rem)] leading-[1.05]">
                        {service.title}
                      </span>
                      <span className="u-mono shrink-0 text-paper/60">{service.index}</span>
                    </span>
                  </span>

                  {/* No row under the card at all. It held the service
                      subtitle with an arrow beside it; with the subtitle
                      gone the arrow was left hanging on a line of its own,
                      and the whole card is already the link. */}
                </Link>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
