"use client";

import Link from "next/link";
import { useRef } from "react";
import { SERVICES } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import Reveal from "@/components/primitives/Reveal";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

/**
 * Service rows that summon a floating preview under the pointer.
 * The preview is a single reused element — one DOM node, one quickTo pair —
 * rather than one image per row fading in and out.
 */
export default function ServicesList() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const preview = el.querySelector<HTMLElement>("[data-preview]");
      const img = preview?.querySelector("img");
      if (!preview || !img) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const xTo = gsap.quickTo(preview, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(preview, "y", { duration: 0.6, ease: "power3.out" });
      const rTo = gsap.quickTo(preview, "rotate", { duration: 0.8, ease: "power3.out" });

      let lastX = 0;
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]", el);

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo(e.clientX - r.left);
        yTo(e.clientY - r.top);
        // Tilt with travel direction, so the card feels carried, not pinned.
        rTo(gsap.utils.clamp(-9, 9, (e.clientX - lastX) * 0.6));
        lastX = e.clientX;
      };

      rows.forEach((row) => {
        const src = row.dataset.src!;
        row.addEventListener("pointerenter", () => {
          img.setAttribute("src", src);
          gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: EASE });
        });
        row.addEventListener("pointerleave", () => {
          gsap.to(preview, { opacity: 0, scale: 0.92, duration: 0.4, ease: "power2.out" });
        });
      });

      el.addEventListener("pointermove", onMove);
      return () => el.removeEventListener("pointermove", onMove);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-[var(--gutter)] py-[clamp(4rem,10vw,9rem)]">
      <Reveal className="flex items-baseline justify-between pb-[clamp(1.5rem,3vw,3rem)]">
        <span className="u-mono text-ember">[ What We Do ]</span>
      </Reveal>

      <ul className="relative">
        {SERVICES.map((service) => {
          const item = bySlug(service.media);
          return (
            <li key={service.slug} className="u-rule">
              <Reveal>
                <Link
                  href={service.href}
                  data-row
                  data-src={`/img/${item.slug}-800.webp`}
                  className="group grid grid-cols-12 items-center gap-3 py-[clamp(1.1rem,2.6vw,2.2rem)] transition-colors"
                >
                  <span className="u-mono col-span-2 text-ink-faint sm:col-span-1">
                    {service.index}
                  </span>
                  <h3 className="u-display col-span-10 text-[clamp(1.5rem,4.6vw,4rem)] leading-[0.95] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3 sm:col-span-7">
                    {service.title}
                  </h3>
                  <p className="col-span-10 col-start-3 text-[0.95rem] text-ink-soft sm:col-span-3 sm:col-start-9 sm:text-right">
                    {service.subtitle}
                  </p>
                  <span className="hidden text-right sm:col-span-1 sm:block">
                    <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            </li>
          );
        })}

        {/* Floating preview */}
        <div
          data-preview
          aria-hidden
          // GSAP owns this element's transform, so centring is done with
          // margins rather than translate utilities that it would overwrite.
          className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[20rem] w-[15rem] overflow-hidden opacity-0 md:block"
          style={{ marginLeft: "-7.5rem", marginTop: "-10rem" }}
        >
          <img alt="" className="h-full w-full object-cover" />
        </div>
      </ul>
    </section>
  );
}
