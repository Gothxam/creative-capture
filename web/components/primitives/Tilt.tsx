"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Pointer-driven 3D tilt. The card leans away from the cursor and lifts
 * slightly toward the viewer, with an optional inner layer that drifts
 * further for parallax depth.
 *
 * Transform-only, so it stays on the compositor. Skipped on coarse pointers,
 * where there is no hover to drive it.
 */
export default function Tilt({
  children,
  className = "",
  /** Maximum rotation, in degrees. */
  max = 9,
  /** How far the card lifts toward the viewer, in px. */
  lift = 26,
  perspective = 900,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  lift?: number;
  perspective?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const card = el?.firstElementChild as HTMLElement | null;
      if (!el || !card) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const rx = gsap.quickTo(card, "rotateX", { duration: 0.55, ease: "power3.out" });
      const ry = gsap.quickTo(card, "rotateY", { duration: 0.55, ease: "power3.out" });
      const rz = gsap.quickTo(card, "z", { duration: 0.55, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        rx(-py * max * 2);
        ry(px * max * 2);
        rz(lift);
      };
      const onLeave = () => {
        rx(0);
        ry(0);
        rz(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root, dependencies: [max, lift] },
  );

  return (
    <div ref={root} className={className} style={{ perspective: `${perspective}px` }}>
      {children}
    </div>
  );
}
