"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, STUDIO } from "@/lib/content";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { EASE, EASE_IO, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const { stop, start } = useSmoothScroll();

  // Hide the bar on the way down, bring it back on the way up.
  // Driven by ScrollTrigger rather than its own scroll listener, so every
  // scroll-reactive piece on the page reads position once per frame from the
  // same source instead of each running its own handler.
  useGSAP(
    () => {
      const el = bar.current;
      if (!el) return;
      let hidden = false;

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          el.dataset.solid = y > 60 ? "true" : "false";
          if (open) return;

          const down = self.direction === 1;
          if (down && y > 220 && !hidden) {
            hidden = true;
            gsap.to(el, { yPercent: -100, duration: 0.55, ease: EASE_IO });
          } else if (!down && hidden) {
            hidden = false;
            gsap.to(el, { yPercent: 0, duration: 0.55, ease: EASE_IO });
          }
        },
      });

      return () => st.kill();
    },
    { scope: bar, dependencies: [open] },
  );

  // Overlay open/close choreography.
  useGSAP(
    () => {
      const el = overlay.current;
      const sheet = el?.querySelector<HTMLElement>("[data-sheet]");
      if (!el || !sheet) return;
      const links = Array.from(el.querySelectorAll<HTMLElement>("[data-link] > span"));
      const aside = Array.from(el.querySelectorAll<HTMLElement>("[data-aside]"));

      if (open) {
        stop();
        gsap.set(el, { pointerEvents: "auto" });
        gsap
          .timeline()
          .set(links, { yPercent: 115 })
          .set(aside, { opacity: 0, y: 16 })
          .to(sheet, { yPercent: 0, duration: 0.85, ease: EASE_IO })
          .to(links, { yPercent: 0, duration: 0.95, ease: EASE, stagger: 0.055 }, 0.3)
          .to(aside, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.07 }, 0.55);
      } else {
        gsap.to(sheet, {
          yPercent: -100,
          duration: 0.7,
          ease: EASE_IO,
          onComplete: () => {
            gsap.set(el, { pointerEvents: "none" });
            start();
          },
        });
      }
    },
    { scope: overlay, dependencies: [open] },
  );

  // Close on route change and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        ref={bar}
        data-solid="false"
        // No backdrop-filter: it repaints the strip behind the bar on every
        // scrolled frame. A near-opaque paper fill reads the same and costs
        // nothing.
        className="group fixed inset-x-0 top-0 z-50 transition-colors duration-500 data-[solid=true]:bg-paper/95"
      >
        <div className="flex h-[var(--nav-h)] items-center justify-between px-[var(--gutter)]">
          <Link href="/" className="u-display text-[1.05rem] leading-none tracking-[-0.02em]">
            Classy
            <span className="text-ember">.</span>
            Captures
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV.slice(1, 8).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="u-mono relative py-1 text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ink transition-transform duration-500 ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/contact"
              className="u-mono hidden border border-ink/25 px-4 py-2 transition-colors hover:border-ink hover:bg-ink hover:text-paper sm:inline-block"
            >
              Enquire
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-[70] flex h-9 w-9 flex-col items-center justify-center gap-[5px]"
            >
              <span
                className={`block h-px w-6 bg-ink transition-transform duration-500 ${
                  open ? "translate-y-[3px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-6 bg-ink transition-transform duration-500 ${
                  open ? "-translate-y-[3px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div ref={overlay} className="pointer-events-none fixed inset-0 z-[60]">
        <div
          data-sheet
          className="absolute inset-0 flex flex-col justify-between bg-ink px-[var(--gutter)] pb-[var(--gutter)] pt-[calc(var(--nav-h)+2rem)] text-paper"
          style={{ transform: "translateY(-100%)" }}
        >
          <nav aria-label="Menu">
            <ul>
              {NAV.map((item, i) => (
                <li key={item.href} className="u-rule border-paper/15">
                  <Link
                    href={item.href}
                    data-link
                    className="mask-line group/link flex items-baseline gap-4 py-[clamp(0.35rem,1.4vw,0.9rem)]"
                  >
                    <span className="flex w-full items-baseline gap-4">
                      <span className="u-mono w-8 shrink-0 text-paper/40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="u-display text-[clamp(2rem,6.4vw,5.5rem)] leading-[0.9] transition-colors duration-300 group-hover/link:text-ember">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-8 pt-8">
            <div data-aside className="u-mono space-y-1 text-paper/60">
              <div>{STUDIO.city}, India</div>
              <div>{STUDIO.coords}</div>
            </div>
            <div data-aside className="u-mono space-y-1 text-right">
              <a href={`mailto:${STUDIO.email}`} className="block hover:text-ember">
                {STUDIO.email}
              </a>
              <a href={`tel:${STUDIO.phoneHref}`} className="block hover:text-ember">
                {STUDIO.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
