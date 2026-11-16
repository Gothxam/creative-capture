"use client";

import { useRef } from "react";
import { HOME } from "@/lib/content";
import { gsap, useGSAP } from "@/lib/gsap";

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
    <section ref={root} className="border-y border-ink/12 px-[var(--gutter)] py-[clamp(2.5rem,5vw,4.5rem)]">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {HOME.stats.map((stat) => (
          <div key={stat.label} data-stat={stat.value}>
            <dd className="u-display text-[clamp(2.4rem,6vw,5rem)] leading-none">
              <span data-value>0</span>
              <span className="text-ember">{stat.suffix}</span>
            </dd>
            <dt className="u-mono mt-3 text-ink-faint">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
