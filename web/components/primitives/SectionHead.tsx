"use client";

import Reveal from "@/components/primitives/Reveal";
import { MaskLines } from "@/components/primitives/MaskText";

/**
 * The heading block every content section opens with.
 *
 * Sections used to announce themselves however they happened to be written:
 * one had a small monospace kicker and nothing else, one had a kicker above a
 * heading that repeated it word for word, one had a kicker and a real title.
 * Read down a page, there was no way to tell where a section began or what it
 * was — which is the other half of the same problem as the columns not lining
 * up, since each block also chose its own place to start.
 *
 * Every section now gets the same two lines in the same column: a kicker that
 * names it, and a heading that says something the kicker does not.
 */
export default function SectionHead({
  label,
  title,
  tone = "ink",
}: {
  label: string;
  title: string;
  /** `paper` for the sections set on ink. */
  tone?: "ink" | "paper";
}) {
  return (
    <div>
      <Reveal>
        <span className="u-mono text-ember">{label}</span>
      </Reveal>
      <MaskLines
        lines={[title]}
        className={`u-display mt-3 text-[clamp(1.4rem,2.4vw,2.1rem)] ${
          tone === "paper" ? "text-paper" : "text-ink"
        }`}
        lineClassName="leading-[1.05]"
      />
    </div>
  );
}
