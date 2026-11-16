"use client";

import { useRef } from "react";
import { bySlug } from "@/lib/media.generated";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

type Props = {
  /** Slug from the generated media manifest. */
  slug: string;
  alt: string;
  className?: string;
  /** Crop box aspect ratio, e.g. "3/4". Omit to use the photograph's own. */
  ratio?: string;
  sizes?: string;
  /** Drift distance as a % of height; 0 disables parallax. */
  parallax?: number;
  /** Wipe the image in from below as it enters view. */
  reveal?: boolean;
  priority?: boolean;
  objectPosition?: string;
};

export default function Figure({
  slug,
  alt,
  className = "",
  ratio,
  sizes = "(max-width: 768px) 100vw, 50vw",
  parallax = 8,
  reveal = true,
  priority = false,
  objectPosition,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const item = bySlug(slug);

  const srcSet = item.widths.map((w) => `/img/${item.slug}-${w}.webp ${w}w`).join(", ");
  const fallback = `/img/${item.slug}-${item.widths[0]}.webp`;

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      const img = wrap?.querySelector("img");
      if (!wrap || !img) return;

      if (reveal) {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: wrap, start: "top 88%", once: true },
        });
        // Figures aren't pre-hidden by CSS, so these render their from-state
        // immediately (the default) — deferring it would make an off-screen
        // image flash full-size before the wipe.
        tl.fromTo(
          wrap,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.35, ease: EASE },
        ).fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.7, ease: EASE }, 0);
      }

      if (parallax > 0) {
        gsap.fromTo(
          img,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: {
              trigger: wrap,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    },
    { scope: wrapRef, dependencies: [slug, reveal, parallax] },
  );

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden bg-paper-deep ${className}`}
      style={{
        aspectRatio: ratio ?? String(item.ratio),
        // The placeholder is a CSS background rather than a blurred <img>.
        // `filter: blur()` on one element per figure meant ~40 filtered
        // layers repainting on every scrolled frame; an 18px source scaled
        // to cover is already soft, so the filter bought nothing.
        backgroundImage: `url(${item.blur})`,
        backgroundSize: "cover",
        backgroundPosition: objectPosition ?? "center",
      }}
    >
      <img
        src={fallback}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        className="media-fill"
        style={{
          objectPosition,
          // Parallax needs room to move without exposing an edge.
          ...(parallax > 0 ? { height: `${100 + parallax}%`, top: `${-parallax / 2}%` } : {}),
        }}
      />
    </div>
  );
}
