"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Showcase reel. The frame starts inset and opens to full bleed as the page
 * scrolls into it, so the film "takes over" rather than merely appearing.
 */
export default function FilmHero() {
  const root = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useGSAP(
    () => {
      const el = root.current;
      const frame = el?.querySelector<HTMLElement>("[data-frame]");
      if (!el || !frame) return;

      gsap.fromTo(
        frame,
        { clipPath: "inset(0% 14% 0% 14%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 80%", end: "top 20%", scrub: 0.6 },
        },
      );

      const video = videoRef.current;
      if (!video) return;
      gsap.to({}, {
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          end: "bottom 5%",
          onEnter: () => void video.play().catch(() => {}),
          onEnterBack: () => void video.play().catch(() => {}),
          onLeave: () => video.pause(),
          onLeaveBack: () => video.pause(),
        },
      });
    },
    { scope: root },
  );

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div ref={root} className="px-[var(--gutter)]">
      <div data-frame className="relative aspect-[16/9] w-full overflow-hidden bg-ink">
        <video
          ref={videoRef}
          className="media-fill"
          src="/video/film-teaser.mp4"
          poster="/img/film-teaser-poster.webp"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Wedding film reel"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause reel" : "Play reel"}
          className="group absolute bottom-5 right-5 flex h-16 w-16 items-center justify-center rounded-full border border-paper/40 text-paper backdrop-blur-sm transition-colors hover:bg-paper hover:text-ink"
        >
          <span className="u-mono">{playing ? "❚❚" : "▶"}</span>
        </button>

        <span className="u-mono absolute left-5 top-5 border border-paper/30 px-2.5 py-1 text-paper">
          Showreel
        </span>
      </div>
    </div>
  );
}
