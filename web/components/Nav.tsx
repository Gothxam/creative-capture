"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, STUDIO } from "@/lib/content";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import { EASE, EASE_IO, ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const { stop, start } = useSmoothScroll();

  // The home page opens on a full-bleed frame, so until the bar takes its
  // paper background the type has to sit in paper too — ink on a lit
  // photograph is unreadable, which is exactly what happened when the hero
  // stopped being a field of type.
  const onMedia = pathname === "/" && !solid && !open;
  const tone = onMedia ? "text-paper" : "text-ink";
  const toneSoft = onMedia ? "text-paper/80" : "text-ink-soft";
  const toneLine = onMedia ? "bg-paper" : "bg-ink";
  const toneEdge = onMedia ? "border-paper/45" : "border-ink/25";

  // Hide the bar on the way down, bring it back on the way up.
  // Driven by ScrollTrigger rather than its own scroll listener, so every
  // scroll-reactive piece on the page reads position once per frame from the
  // same source instead of each running its own handler.
  useGSAP(
    () => {
      const el = bar.current;
      if (!el) return;
      let hidden = false;

      // While the menu is open the bar must stay put: it carries the only
      // control that closes it, so letting it slide away traps the visitor.
      if (open) {
        gsap.to(el, { yPercent: 0, duration: 0.4, ease: EASE_IO });
      }

      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          const isSolid = y > 60;
          el.dataset.solid = isSolid ? "true" : "false";
          setSolid((was) => (was === isSolid ? was : isSolid));
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

      // `y: 0` is pinned at both ends on purpose. The sheet carries an inline
      // `translateY(-100%)` so it is off-screen on first paint, before any
      // script runs. GSAP reads that transform on init and banks it as a base
      // `y` in pixels, so animating `yPercent` alone stacks on top of it: the
      // sheet sat at -200% and "opening" only brought it to -100%, still
      // entirely above the viewport. Pinning `y` makes the tween authoritative.
      if (open) {
        stop();
        gsap.set(el, { pointerEvents: "auto" });
        gsap
          .timeline()
          .set(links, { yPercent: 115 })
          .set(aside, { opacity: 0, y: 16 })
          .to(sheet, { yPercent: 0, y: 0, duration: 0.85, ease: EASE_IO })
          .to(links, { yPercent: 0, duration: 0.95, ease: EASE, stagger: 0.055 }, 0.3)
          .to(aside, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.07 }, 0.55);
      } else {
        gsap.to(sheet, {
          yPercent: -100,
          y: 0,
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

  // Lock the page behind the sheet.
  //
  // Lenis's `stop()` is not enough on touch: `syncTouch` is off so native
  // momentum scrolling is never intercepted, and with prefers-reduced-motion
  // there is no Lenis instance at all. Hiding overflow on the root element
  // covers every case.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

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
        // Above the overlay (z-60), not below it: the close button lives in
        // here, and at z-50 the open sheet covered it so the menu could not
        // be dismissed. `data-open` recolours the bar for the dark sheet.
        data-open={open}
        className="group fixed inset-x-0 top-0 z-[80] transition-colors duration-500 data-[open=false]:data-[solid=true]:bg-paper/95"
      >
        <div className="flex h-[var(--nav-h)] items-center justify-between px-[var(--gutter)]">
          <Link
            href="/"
            className={`u-display text-[1.05rem] leading-none tracking-[-0.02em] transition-colors duration-300 ${
              open ? "text-paper" : tone
            }`}
          >
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
                  className={`u-mono relative py-1 transition-colors ${toneSoft} ${
                    onMedia ? "hover:text-paper" : "hover:text-ink"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px w-full origin-left transition-transform duration-500 ${toneLine} ${
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
              className={`u-mono hidden border px-4 py-2 transition-colors sm:inline-block ${
                open
                  ? "border-paper/30 text-paper hover:border-paper hover:bg-paper hover:text-ink"
                  : `${toneEdge} ${tone} ${onMedia ? "hover:border-paper hover:bg-paper hover:text-ink" : "hover:border-ink hover:bg-ink hover:text-paper"}`
              }`}
            >
              Enquire
            </Link>

            {/* Only below `lg`. Above it the full nav is already on the bar,
                so a second way in was redundant. A 44px hit area, which is
                the minimum comfortable tap target. */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              <span
                className={`block h-px w-6 transition-all duration-500 ${
                  open ? "translate-y-[3px] rotate-45 bg-paper" : toneLine
                }`}
              />
              <span
                className={`block h-px w-6 transition-all duration-500 ${
                  open ? "-translate-y-[3px] -rotate-45 bg-paper" : toneLine
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div
        ref={overlay}
        id="site-menu"
        className="pointer-events-none fixed inset-0 z-[60]"
        aria-hidden={!open}
      >
        <div
          data-sheet
          // Scrollable, and the scroll does not chain to the page behind it,
          // for short screens where nine items plus the contact block run
          // past the viewport.
          className="absolute inset-0 flex flex-col justify-between gap-10 overflow-y-auto overscroll-contain bg-ink px-[var(--gutter)] pb-[var(--gutter)] pt-[calc(var(--nav-h)+2rem)] text-paper"
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
