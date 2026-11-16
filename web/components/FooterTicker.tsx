"use client";

import { FOOTER, STUDIO } from "@/lib/content";
import Marquee from "@/components/primitives/Marquee";

/** The circled monogram that punctuates the ticker. */
function Mark() {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current">
      <span className="u-display text-[0.62rem] leading-none">CC</span>
    </span>
  );
}

function Brackets({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="opacity-45">[</span>
      <span className="u-mono">{children}</span>
      <span className="opacity-45">]</span>
    </span>
  );
}

function Wordmark() {
  return (
    <span className="u-display text-[1.45rem] leading-none tracking-[-0.045em]">
      Classy Captures
    </span>
  );
}

/**
 * The band across the top of the footer: logo marks, the wordmark, bracketed
 * meta and two lines of studio copy, cycling past. Mixed content rather than
 * one repeated phrase, so it reads as a masthead rather than a banner.
 */
export default function FooterTicker() {
  const items: React.ReactNode[] = [
    <Mark key="m1" />,
    <Brackets key="b1">{FOOTER.discipline}</Brackets>,
    <Wordmark key="w1" />,
    <span key="t1" className="u-mono max-w-[26ch] whitespace-normal text-[0.55rem] leading-[1.35] opacity-70">
      {FOOTER.blurbs[0]}
    </span>,
    <Mark key="m2" />,
    <span key="p1" className="inline-flex items-center gap-3">
      <span aria-hidden>✳</span>
      <span className="u-mono rounded-full border border-current px-4 py-1.5">{FOOTER.pill}</span>
      <span aria-hidden>✳</span>
    </span>,
    <Wordmark key="w2" />,
    <span key="t2" className="u-mono max-w-[26ch] whitespace-normal text-[0.55rem] leading-[1.35] opacity-70">
      {FOOTER.blurbs[1]}
    </span>,
    <Mark key="m3" />,
    <Brackets key="b2">{FOOTER.years}</Brackets>,
    <Wordmark key="w3" />,
    <Brackets key="b3">{STUDIO.city}</Brackets>,
  ];

  return (
    <div className="border-b border-paper/20 py-3.5">
      <Marquee items={items} speed={46} separator={null} className="text-paper" />
    </div>
  );
}
