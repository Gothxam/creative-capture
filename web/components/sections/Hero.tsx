"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { HOME } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import { useAppReady } from "@/lib/appReady";
import { EASE, ScrollTrigger, gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";

/**
 * The opening screen is the work, not the name.
 *
 * It was a viewport of display type with a video strip beneath it, which is
 * the wrong order of business for a photography studio — the studio's name is
 * already in the bar above and set enormous in the footer, so saying it a
 * third time cost the whole first screen. Now the frame fills the viewport
 * and the type sits in the margins around it.
 *
 * Frames cross-fade on a timer with a slow push in. Only one is at full
 * opacity at a time, and a film only plays while it is the frame on screen.
 *
 * Every source is asked for at the largest size it actually has. An earlier
 * version hardcoded `-2200.webp`, which exists for three photographs in the
 * whole library; for everything else that URL was a 404 and the browser fell
 * back to whatever the srcset offered.
 */

const REEL = HOME.hero.reel;
const HOLD = 5.4; // seconds each frame is held
const FADE = 1.3;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const ready = useAppReady();
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      if (!ready) return;
      const el = root.current;
      if (!el) return;

      const rise = Array.from(el.querySelectorAll<HTMLElement>("[data-rise]"));
      const frames = gsap.utils.toArray<HTMLElement>("[data-frame]", el);
      const bar = el.querySelector<HTMLElement>("[data-bar]");

      // The overlay type arrives after the curtain, from the edges inward.
      gsap.fromTo(
        rise,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08, delay: 0.25 },
      );

      // The first frame is already on screen — the markup gives it opacity 1
      // and the others 0, so it is painted before any of this runs and the
      // loader lifts straight onto the photograph.
      //
      // It used to be faded in from 0 here, which put a black screen between
      // the curtain going up and the picture arriving: the section's own
      // background is ink, so "fade the photograph in" reads as a blink. The
      // reveal belongs to the loader; this only has to not undo it.
      gsap.set(frames.slice(1), { opacity: 0 });
      void frames[0]?.querySelector("video")?.play().catch(() => {});

      if (prefersReducedMotion() || frames.length < 2) return;

      // Slow push in on whichever frame is showing.
      const push = (i: number) => {
        const media = frames[i].querySelector<HTMLElement>("[data-push]");
        if (!media) return;
        gsap.fromTo(media, { scale: 1 }, { scale: 1.075, duration: HOLD + FADE, ease: "none" });
      };
      push(0);

      let i = 0;
      const advance = () => {
        const next = (i + 1) % frames.length;
        const outgoingFrame = frames[i];

        // The incoming frame fades up ON TOP of the outgoing one, which stays
        // fully opaque underneath until the new frame has completely covered
        // it.
        //
        // Fading both at once — one down, one up — looks like it should
        // cross-fade, but two stacked half-transparent frames do not add up
        // to an opaque screen: part of the section's ink background shows
        // through the middle of every transition. Measured, the page dropped
        // from a mean luminance of 107 to 73 and back on each change, which
        // is the dark blink between photographs.
        gsap.set(frames[next], { zIndex: 1 });
        gsap.to(frames[next], {
          opacity: 1,
          duration: FADE,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(outgoingFrame, { opacity: 0 });
            gsap.set(frames[next], { zIndex: 0 });
          },
        });
        push(next);

        // Only the frame on screen gets to decode.
        const outgoing = frames[i].querySelector<HTMLVideoElement>("video");
        const incoming = frames[next].querySelector<HTMLVideoElement>("video");
        if (outgoing) gsap.delayedCall(FADE, () => outgoing.pause());
        if (incoming) {
          incoming.currentTime = 0;
          void incoming.play().catch(() => {});
        }

        i = next;
        setActive(next);
      };

      const cycle = gsap.timeline({ repeat: -1 });
      cycle.to({}, { duration: HOLD }).call(advance);

      if (bar) {
        gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: HOLD, ease: "none", repeat: -1 });
      }

      // Don't burn frames cross-fading to a hidden tab.
      const onVis = () => (document.hidden ? cycle.pause() : cycle.resume());
      document.addEventListener("visibilitychange", onVis);

      // Nor to a screen nobody is looking at any more. The reel ran for the
      // whole length of the page: three films decoding, a cross-fade every
      // five seconds and a slow scale on a full-viewport frame, all of it
      // off-screen from the second section onward. That is the most
      // expensive thing on the page and it was competing with every scroll
      // the visitor actually cared about.
      const watch = ScrollTrigger.create({
        trigger: el,
        start: "bottom top",
        onEnter: () => {
          cycle.pause();
          el.querySelectorAll("video").forEach((v) => v.pause());
        },
        onLeaveBack: () => {
          cycle.resume();
          // Whichever frame is actually showing, rather than a guess from
          // the timeline's clock.
          const live = frames.find((f) => Number(gsap.getProperty(f, "opacity")) > 0.5);
          void live?.querySelector("video")?.play().catch(() => {});
        },
      });

      return () => {
        document.removeEventListener("visibilitychange", onVis);
        watch.kill();
      };
    },
    { scope: root, dependencies: [ready] },
  );

  const current = REEL[active];

  return (
    // Overlaid on a wide screen; stacked on a phone.
    //
    // Full-bleed works at 1.6 and fails at 0.46. Every frame in this reel is
    // landscape — 1.51 for the stills, 1.78 for the film — so a phone was
    // cutting 69% to 74% off each one and showing a tight vertical slice of
    // a composed photograph. The type fared worse: laid over a bright saree,
    // "Thirty years of South Indian weddings" was effectively invisible, and
    // no scrim strong enough to fix that leaves the picture worth looking at.
    //
    // Below `md` the photograph keeps a 4/5 box of its own — which costs it
    // 47% instead of 69% — and the words sit underneath on ink, where they
    // are legible against anything.
    <section
      ref={root}
      className="relative flex min-h-[100svh] w-full flex-col overflow-clip bg-ink md:block md:h-[100svh] md:min-h-[560px]"
    >
      <div className="relative order-2 aspect-[4/5] w-full shrink-0 md:absolute md:inset-0 md:order-none md:aspect-auto">
      {REEL.map((frame, i) => {
        const item = frame.kind === "image" ? bySlug(frame.slug) : null;
        return (
          // Hidden from the first paint, not from whenever the script gets
          // round to it. These four frames are stacked on top of each other,
          // and GSAP only set the opacity of the later ones to 0 once the
          // loader had finished — so for the first few seconds every frame
          // was at full opacity and the LAST one in the markup was what you
          // saw, while the counter underneath already read "01 / 04".
          <div
            key={frame.slug}
            data-frame
            className="absolute inset-0"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            <div data-push className="absolute inset-0 will-change-transform">
              {frame.kind === "video" ? (
                <video
                  className="media-fill"
                  src={`/video/${frame.slug}.mp4`}
                  poster={`/img/${frame.slug}-poster.webp`}
                  muted
                  loop
                  playsInline
                  preload={i === 0 ? "auto" : "none"}
                  aria-label={frame.caption}
                />
              ) : (
                <img
                  className="media-fill"
                  // The largest size this photograph actually has, not a
                  // width assumed for all of them.
                  src={`/img/${frame.slug}-${item!.widths[0]}.webp`}
                  srcSet={item!.widths.map((w) => `/img/${frame.slug}-${w}.webp ${w}w`).join(", ")}
                  sizes="100vw"
                  // Only where a frame declares one; otherwise the photograph
                  // stays centred, which is right for most of them.
                  style={"focus" in frame ? { objectPosition: frame.focus } : undefined}
                  alt={`${frame.caption}, ${frame.place}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                  draggable={false}
                />
              )}
            </div>
          </div>
        );
      })}

        {/* Scrims. Only where type is laid over the picture, which is only
            on a wide screen now. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-40 bg-gradient-to-b from-ink/55 to-transparent md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-56 bg-gradient-to-t from-ink/70 to-transparent md:block" />
      </div>

      <div className="order-1 px-[var(--gutter)] pb-4 pt-[calc(var(--nav-h)+0.75rem)] text-paper md:absolute md:inset-x-0 md:top-0 md:z-10 md:p-[var(--gutter)] md:pt-[calc(var(--nav-h)+0.75rem)]">
        {/* The eyebrow moved into the centred stack below, where the
            reference puts its product label. What is left up here is the
            meta strip, which has no equivalent on that page but is the one
            line that says what the studio actually shoots. */}
        <div className="flex items-start justify-end gap-6">
          <span data-rise className="u-mono hidden text-right text-paper/70 sm:block">
            {HOME.hero.meta.join(" · ")}
          </span>
        </div>
      </div>

      {/* The hero stack: dot-matrix label, headline, one line under it, and
          a single action — centred, which is the reference's whole hero
          composition. This was a lead paragraph in the bottom-left corner
          with the frame counter opposite, an editorial masthead rather than
          a page that asks you to go somewhere. */}
      <div className="order-3 flex flex-1 flex-col items-center justify-center gap-4 px-[var(--gutter)] py-9 text-center text-paper md:absolute md:inset-x-0 md:top-1/2 md:z-10 md:flex-none md:-translate-y-1/2 md:gap-5 md:py-0">
        {/* A scrim just behind the words. The full-width top and bottom
            gradients do nothing for type sitting in the middle of a lit
            photograph. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[34rem] w-[min(68rem,92vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(4,4,4,0.78)_0%,rgba(4,4,4,0.52)_38%,rgba(4,4,4,0.2)_62%,transparent_80%)] md:block"
        />

        <span
          data-rise
          className="u-dot relative text-[clamp(0.8rem,1.35vw,1.2rem)] leading-none text-paper"
        >
          {HOME.hero.eyebrow}
        </span>

        <h1
          data-rise
          className="u-display relative max-w-[17ch] text-[clamp(1.85rem,3.4vw,3rem)] leading-[1.0]"
        >
          {HOME.hero.headline}
        </h1>

        <p data-rise className="u-body relative max-w-[48ch] text-paper/85">
          {HOME.hero.lead}
        </p>

        <Link
          data-rise
          href="/weddings"
          className="u-pill u-pill-invert relative mt-2"
        >
          {HOME.hero.cta}
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* What is left at the foot: which frame you are looking at, and
          where it was taken. The lead that used to anchor this corner is
          now in the centred stack. */}
      <div className="order-4 flex flex-col justify-end gap-6 px-[var(--gutter)] pb-[calc(var(--gutter)+0.5rem)] pt-2 text-paper md:absolute md:inset-x-0 md:bottom-0 md:z-10 md:flex-row md:flex-wrap md:items-end md:justify-end md:gap-x-10 md:gap-y-6 md:p-[var(--gutter)]">
        <div data-rise className="flex items-end justify-between gap-8 md:justify-end">
          <span className="u-mono text-left text-paper/75 sm:text-right">
            {current.caption}
            <br />
            <span className="text-paper/50">{current.place}</span>
          </span>
          <span className="u-mono tabular-nums text-paper/75">
            {String(active + 1).padStart(2, "0")}
            <span className="text-paper/40"> / {String(REEL.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-paper/20">
        <div data-bar className="h-px origin-left bg-paper/80" />
      </div>

      {/* A scroll hint, not the city. The city was being said three times on
          one screen — here, in the eyebrow, and again in the frame caption. */}
      <span className="u-mono pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-paper/55 md:block">
        Scroll
      </span>
    </section>
  );
}
