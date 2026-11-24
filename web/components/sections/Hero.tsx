"use client";

import Link from "next/link";
import { useRef } from "react";
import { HOME } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import { useAppReady } from "@/lib/appReady";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * The opening screen: photographs held in a dark space, with the words in
 * the clearing at its centre.
 *
 * This replaces a full-bleed cross-fading reel. That reel put type over a lit
 * photograph, which needed a scrim heavy enough to spoil the picture it was
 * laid on — and on a phone it cut 47% off every frame to fill a portrait
 * viewport. Here nothing is cropped to the screen: each frame keeps its own
 * shape and sits in the black with air around it.
 *
 * A note on the reference this is drawn from. Its hero reads as an object
 * floating in a void, but that is art direction, not code: every image on
 * that page reports `transform: none` at every scroll position, and nothing
 * on it moves on scroll at all. The floating quality comes from a product
 * shot on black with the dot grid behind it. Wedding photographs cannot be
 * cut out of their backgrounds that way, so the equivalent here is to treat
 * whole frames as planes and give the space real depth.
 *
 * The depth is one transform, not sixteen. Every plane sits in a single
 * perspective container, and the scroll moves that container — so the planes
 * separate by parallax for free, because perspective does the arithmetic,
 * and the page animates one element instead of one per photograph. This
 * matters here: the frame budget on this site has been fought for, and the
 * reel this replaces was the most expensive thing on the page.
 */

/**
 * Where each frame sits, how big it is, and how far it drifts.
 *
 * Square crops at two sizes only, scattered the way the reference's
 * product pages place their detail shots around a subject: small cards,
 * 8px corners, no label on any of them. Two sizes — a pair of larger
 * frames and a pair of small ones — because a field where every card is a
 * different size stops reading as a set.
 *
 * Size is what carries depth. A bigger frame reads as nearer, and `drift` —
 * how far it travels over a screen's worth of scroll — follows it, so the
 * near ones sweep past and the far ones barely move. That difference in rate
 * is the whole illusion.
 *
 * It is a translation, not a change of depth, and that is a measured
 * decision twice over. Flying the field forward on `z` makes perspective
 * rescale every plane continuously, so each re-rasterizes every frame: over
 * three runs it took frames above 20ms from ~4.8% to ~15%. And the
 * perspective was not even drawing: every plane rendered at exactly its
 * authored CSS size, because the entrance tween animated `z` to 0 and GSAP
 * owns the whole transform once it touches one part of it. A 3D context that
 * costs a layer per photograph and renders identically to a flat one is not
 * worth keeping.
 */
const PLANES = [
  { slug: "mandap-garland", x: 13, y: 26, w: 13, drift: -170, hide: false },
  { slug: "sindoor-moment", x: 22, y: 73, w: 8, drift: -95, hide: false },
  { slug: "bride-jewels", x: 86, y: 23, w: 8, drift: -90, hide: false },
  { slug: "garland-knot", x: 80, y: 70, w: 13, drift: -180, hide: false },
  // Only where there is width for it. There is deliberately nothing along
  // the top: a frame up there sits behind the nav, and a lit photograph
  // under the nav links costs more legibility than the depth is worth.
  { slug: "temple-groom", x: 37, y: 89, w: 7, drift: -120, hide: true },
] as const;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const ready = useAppReady();

  useGSAP(
    () => {
      if (!ready) return;
      const el = root.current;
      if (!el) return;

      const rise = Array.from(el.querySelectorAll<HTMLElement>("[data-rise]"));
      const tilt = el.querySelector<HTMLElement>("[data-tilt]");
      const planes = gsap.utils.toArray<HTMLElement>("[data-plane]", el);

      gsap.fromTo(
        rise,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08, delay: 0.25 },
      );

      // The frames settle into place rather than arriving from depth.
      //
      // This used to animate `z` from -340 to 0, which quietly destroyed the
      // thing it was decorating: GSAP takes over the element's whole
      // transform, so ending at z:0 overwrote each plane's own depth and
      // left all five on the same plane. Measured, every plane rendered at
      // exactly its authored CSS size — the perspective was doing nothing at
      // all, while still costing a 3D rendering context and a composited
      // layer per photograph.
      gsap.fromTo(
        planes,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.6,
          ease: EASE,
          stagger: { each: 0.09, from: "random" },
          delay: 0.1,
        },
      );

      if (prefersReducedMotion()) return;

      // Each plane drifts at its own rate, scrubbed against the screen.
      // Pure Y, so nothing rescales and nothing re-rasterizes; the depth
      // these planes already have is static, painted once by `perspective`
      // when they were placed.
      // Every plane is in the DOM in `PLANES` order — the wide-screen-only
      // one is hidden with a display rule, not dropped — so the index lines
      // the element up with its own drift.
      const fly = gsap.to(planes, {
        y: (i: number) => PLANES[i]?.drift ?? -140,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      });

      // Pointer tilt, on its own wrapper so it never fights the scrub above.
      // Coarse pointers get nothing: there is no hover on a phone, and the
      // listener would run for a gesture that is already scrolling the page.
      // Pointer parallax, as a translation rather than a rotation. A rotate
      // needs a 3D context to mean anything, and that context is what this
      // hero just stopped paying for.
      let onMove: ((e: PointerEvent) => void) | undefined;
      if (tilt && window.matchMedia("(pointer: fine)").matches) {
        const setX = gsap.quickTo(tilt, "x", { duration: 1.1, ease: "power3.out" });
        const setY = gsap.quickTo(tilt, "y", { duration: 1.1, ease: "power3.out" });
        onMove = (e: PointerEvent) => {
          setX((e.clientX / window.innerWidth - 0.5) * -26);
          setY((e.clientY / window.innerHeight - 0.5) * -18);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
      }

      // Nothing to animate once the screen is behind you.
      const watch = ScrollTrigger.create({
        trigger: el,
        start: "bottom top",
        onEnter: () => fly?.scrollTrigger?.disable(false),
        onLeaveBack: () => fly?.scrollTrigger?.enable(false),
      });

      return () => {
        if (onMove) window.removeEventListener("pointermove", onMove);
        watch.kill();
      };
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] w-full items-center justify-center overflow-clip bg-ink text-paper"
    >

      {/* The stage.
          Flat, by measurement. The depth here is read from how big each
          frame is, how dark its surround is and how far it sits from the
          others — not from a 3D context, which rendered identically and
          cost a composited layer per photograph. */}
      {/* Inset on a phone, so the percentages are measured inside a padded
          box: at 375px the outermost cards sat 3px from the screen edge and
          their captions ran off it. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-4 inset-y-0 md:inset-0">
        <div data-tilt className="absolute inset-0">
          <div className="absolute inset-0">
            {PLANES.map((p) => {
              const item = bySlug(p.slug);
              return (
                <figure
                  key={p.slug}
                  data-plane

                  data-reveal
                  className={`absolute ${p.hide ? "hidden xl:block" : ""}`}
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    width: `${p.w}vw`,
                    minWidth: "92px",
                    // The `translate` property, not `transform`. GSAP owns
                    // `transform` on these elements for the drift and the
                    // entrance; centring written there would be overwritten
                    // by the first tween that touches y, which is exactly
                    // how the depth on this hero was silently lost.
                    translate: "-50% -50%",
                  }}
                >
                  <span className="block aspect-square w-full overflow-hidden rounded-panel bg-ink-soft/25 shadow-[0_1.5rem_4rem_rgba(0,0,0,0.7)] ring-1 ring-white/[0.08]">
                    <img
                      src={`/img/${p.slug}-800.webp`}
                      srcSet={item.widths
                        .map((w) => `/img/${p.slug}-${w}.webp ${w}w`)
                        .join(", ")}
                      sizes="14vw"
                      alt=""
                      loading="eager"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </span>
                </figure>
              );
            })}
          </div>
        </div>
      </div>

      {/* The clearing. Above the stage, so a plane flying forward passes
          behind the words rather than across them. */}
      {/* Gaps are deliberately uneven: the label sits close to the headline
          it names, then the supporting line and the action each get real
          air. Even spacing on four stacked elements is what made this read
          as one crowded block rather than a label, a statement and a way
          in. */}
      <div className="relative z-10 flex w-full flex-col items-center px-[var(--gutter)] py-[calc(var(--nav-h)+2rem)] text-center">
        <span
          data-rise

          data-reveal
          className="u-mono text-[0.68rem] leading-none tracking-[0.2em] text-paper/60"
        >
          {HOME.hero.eyebrow}
        </span>

        <h1
          data-rise

          data-reveal
          className="u-display mt-5 max-w-[15ch] text-[clamp(1.6rem,2.7vw,2.4rem)] leading-[1.06]"
        >
          {HOME.hero.headline}
        </h1>

        <p data-rise data-reveal className="u-body mt-7 max-w-[38ch] text-paper/70">
          {HOME.hero.lead}
        </p>

        <Link data-rise data-reveal href="/weddings" className="u-pill u-pill-invert mt-9">
          {HOME.hero.cta}
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 p-[var(--gutter)]">
        <span data-rise data-reveal className="u-mono hidden text-paper/55 sm:block">
          {HOME.hero.meta.join(" · ")}
        </span>
        <span data-rise data-reveal className="u-mono text-paper/55">
          Scroll
        </span>
      </div>
    </section>
  );
}
