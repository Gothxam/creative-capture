"use client";

import { useRef } from "react";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Vertical travel in px. */
  y?: number;
  delay?: number;
  duration?: number;
  /** Stagger direct children instead of animating the wrapper itself. */
  stagger?: number;
  /** Viewport position that triggers the reveal. */
  start?: string;
  as?: "div" | "section" | "ul" | "li" | "article" | "span" | "figure" | "header" | "footer";
};

/**
 * Fades + lifts an element (or staggers its direct children) as it enters view.
 * Targets are pre-hidden by CSS under `.js-ready`, so a failed script leaves
 * content visible rather than blank.
 */
export default function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
  duration = 1.1,
  stagger,
  start = "top 85%",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const targets: Element[] = stagger ? Array.from(el.children) : [el];
      if (!targets.length) return;

      // fromTo + immediateRender:false — see the note in MaskText: a set/to
      // pair gets its values rewritten by ScrollTrigger refreshes.
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: EASE,
          stagger: stagger ?? 0,
          immediateRender: false,
          scrollTrigger: { trigger: el, start, once: true },
        },
      );
    },
    { scope: ref, dependencies: [stagger, y, delay, duration, start] },
  );

  const hideAttr = stagger ? { "data-reveal-children": "" } : { "data-reveal": "" };

  return (
    // @ts-expect-error polymorphic tag — ref resolves correctly at runtime
    <Tag ref={ref} {...hideAttr} className={className}>
      {children}
    </Tag>
  );
}
