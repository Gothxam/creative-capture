"use client";

import Link from "next/link";
import { useRef } from "react";
import { HOME } from "@/lib/content";
import { bySlug } from "@/lib/media.generated";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

type Card = { slug: string; title: string; meta: string };

/**
 * The strip under the hero.
 *
 * Three rules shaped this list. Nothing here appears in the hero above it —
 * the two sat within one scroll of each other and were showing the same
 * photographs twice. Nothing here carries another client's name: the frame
 * that used to sit eighth has "INCHARA" set across the top of it, which is a
 * different couple's branding to be running in a portfolio. And every frame
 * is large enough for the box it lands in — at a 56vh height a standing
 * photograph asks for about 400px, which the 800px files cover twice over.
 */
const CARDS: Card[] = [
  { slug: "garland-knot", title: "The Garlands", meta: "Bengaluru · Wedding" },
  { slug: "rain-embrace", title: "Monsoon", meta: "Karnataka · Pre-Wedding" },
  { slug: "petals-twirl", title: "Rose Hour", meta: "Studio · Portrait" },
  { slug: "kalash-hands", title: "The Vow", meta: "Temple · Ritual" },
  { slug: "riverbed", title: "The Riverbed", meta: "Karnataka · Pre-Wedding" },
  { slug: "mehndi-frame", title: "Mehndi", meta: "Bengaluru · Detail" },
  { slug: "stairwell-bw", title: "The Descent", meta: "Bengaluru · Wedding" },
  { slug: "window-silhouette", title: "In Silhouette", meta: "Studio · Portrait" },
  { slug: "sindoor-moment", title: "Sindoor", meta: "South India · Wedding" },
];

/**
 * One height for every frame; width falls out of each photograph's own
 * aspect ratio, so the row still has rhythm without the captions landing at
 * nine different heights. The arc supplies the variation that the staggered
 * heights used to.
 */
/**
 * One height for every frame, and a big one.
 *
 * Two previous attempts at giving this row character failed in opposite
 * directions. A circular arc bent the whole strip and threw each caption
 * into the picture beside it. Staggered heights fixed that but left a ragged
 * top edge with nothing deciding where any particular frame should sit, so
 * the placement read as arbitrary.
 *
 * The variation comes from the photographs themselves now. At a single
 * generous height a standing frame is narrow and a landscape is nearly three
 * times as wide, so the row already has rhythm without anything being
 * arranged — and at 78vh the work is large enough to be looked at rather
 * than scanned.
 */
const FRAME_HEIGHT = "h-[52vh] md:h-[78vh]";

/**
 * How far each photograph travels inside its frame, as a percentage of the
 * frame's width. The image is rendered twice this much wider than the frame,
 * so it has exactly this much slack on each side.
 */
const PARALLAX = 6;
const OVERSIZE = `${100 + PARALLAX * 2}%`;

/**
 * The same travel expressed as a share of the image's own width.
 *
 * `xPercent` is measured against the element being moved, not its parent, so
 * sliding a 112%-wide image by 6% of itself moves it 6.7% of the frame while
 * only 6% of slack exists on each side. The difference showed up as an 8px
 * strip of background down one edge of every frame, at every scroll position.
 */
const SLIDE = (PARALLAX * 100) / (100 + PARALLAX * 2);

/**
 * How long the page is held still while the row travels, in screens.
 *
 * Expressed in screens on purpose. This used to be a share of the track's
 * own width, which quietly re-lengthened the hold every time the frames grew:
 * raising them to 78vh widened the row from 5,366px to 7,379px and took the
 * pin from 2.4 screens back up to 3.6 without a line of it being touched.
 * The number that matters to someone scrolling is how long the page refuses
 * to move, so that is the number the code states.
 */
const HELD_SCREENS = 2.6;

/**
 * Pinned horizontal gallery. The track is translated by exactly the distance
 * it overflows, measured through a function so it re-derives on every resize
 * and refresh rather than baking in a first-paint number.
 *
 * Below `md` the same track becomes a native swipe strip.
 */
export default function HorizontalWork() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const track = el.querySelector<HTMLElement>("[data-track]");
      if (!track) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const bar = el.querySelector<HTMLElement>("[data-bar]");
        const count = el.querySelector<HTMLElement>("[data-count]");
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);

        // Each photograph is held wider than its frame and slides the
        // opposite way as the card crosses the screen, so the row has depth
        // without being bent into a curve.
        //
        // The geometry it needs is measured once per refresh, not per frame.
        // Reading `getBoundingClientRect()` inside the scroll handler forced
        // the browser to flush layout after every transform GSAP had just
        // written — nine cards, nine synchronous reflows per frame — which is
        // half of why this section stuttered. `offsetLeft` and `offsetWidth`
        // are untouched by the track's transform, so one read at setup is
        // enough and the loop below never touches the DOM.
        let geom: { img: (v: number) => void; mid: number }[] = [];
        const measure = () => {
          geom = cards.map((card) => ({
            img: gsap.quickSetter(card.querySelector("img") as HTMLElement, "xPercent") as (
              v: number,
            ) => void,
            mid: card.offsetLeft + card.offsetWidth / 2,
          }));
        };
        measure();

        const paint = (progress: number) => {
          // The track's real position, not the scroll's. These are not the
          // same number while a scrub is easing, and using the wrong one is
          // exactly the bug this replaced.
          const travel = distance();
          const x = -travel * progress;
          const half = window.innerWidth / 2;
          const reach = window.innerWidth;

          for (const g of geom) {
            // -1 at the left of the viewport, +1 at the right.
            const t = gsap.utils.clamp(-1, 1, (g.mid + x - half) / reach);
            g.img(-t * SLIDE);
          }

          if (bar) gsap.set(bar, { scaleX: Math.max(0.02, progress) });
          if (count) {
            const n = Math.min(CARDS.length, Math.ceil(progress * CARDS.length) || 1);
            count.textContent = String(n).padStart(2, "0");
          }
        };

        // One trigger, not two. The track used to move on `scrub: 0.5` while
        // the parallax was driven by a second trigger on `scrub: true`, so
        // the images were computed at the live scroll position while the
        // frames under them were still easing toward it. The phase error
        // grew and shrank with scroll speed, which is the other half of the
        // stutter — and no amount of smoothing fixes it while the two run on
        // separate clocks. Everything now reads from the same progress.
        // The parallax hangs off the tween's own `onUpdate`, not the
        // trigger's. A scrubbed tween eases toward the scroll position, so
        // `ScrollTrigger.progress` leads `tween.progress()` by however far
        // the scrub is still travelling — reading the trigger would put the
        // images back out of step with the frames they sit in.
        let tween: gsap.core.Tween | null = null;
        tween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          onUpdate: () => tween && paint(tween.progress()),
          scrollTrigger: {
            trigger: el,
            start: "top top",
            // The row used to travel 1px for every 1px scrolled, which held
            // the page still for four and a half screens — long enough to
            // feel stuck rather than deliberate. The frames now cross at
            // whatever speed it takes to be done in HELD_SCREENS.
            end: () => `+=${Math.round(HELD_SCREENS * window.innerHeight)}`,
            pin: true,
            // 1:1 with the scroll position, not eased toward it. Lenis is
            // already smoothing this page at lerp 0.095, so a scrub on top
            // was a second ease stacked on the first: the row kept gliding
            // after the wheel stopped and answered late when it started,
            // which reads as lag rather than smoothness.
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onRefresh: measure,
          },
        });
        paint(0);

        return () => tween?.kill();
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-paper py-[clamp(2rem,4vw,3.5rem)]">
      <div className="flex flex-wrap items-end justify-between gap-6 px-[var(--gutter)] pb-[clamp(1.5rem,3vw,2.75rem)]">
        {/* The label and the heading were the same two words — "[ Selected
            Work ]" above "SELECTED WORK" at up to 96px, which took the top
            third of the section before a single photograph appeared. The
            label does the job on its own and the frames start higher. */}
        <h2 className="u-mono text-ember">{HOME.work.label}</h2>
        {/* Hidden on a phone, where the row is a grid: there is nothing
            to drag and the counter counts a position that no longer moves. */}
        <div className="hidden items-center gap-5 md:flex">
          <span className="u-mono text-ink-faint">{HOME.work.note} →</span>
          <span className="u-mono">
            <span data-count>01</span>
            <span className="text-ink-faint"> / {String(CARDS.length).padStart(2, "0")}</span>
          </span>
        </div>
      </div>

      <div>
        <div
          data-track
          // A row on a wide screen; a grid on a phone.
          //
          // Below md this used to stay a horizontal strip you swiped. It did
          // work — a dispatched touch gesture moves it — but at 390px a
          // single frame fills the screen, there is no scrollbar and nothing
          // says the other eight exist, so it read as a section containing
          // one photograph. Two columns show them all without asking anyone
          // to find a gesture.
          className="flex w-max items-center gap-[clamp(1.25rem,2.6vw,2.75rem)] px-[var(--gutter)] max-md:grid max-md:w-full max-md:grid-cols-2 max-md:items-start max-md:gap-2 max-md:px-[var(--gutter)]"
        >
        {CARDS.map((card, i) => {
          const item = bySlug(card.slug);
          // Each frame keeps its photograph's own proportions, so the widths
          // along the arc vary naturally instead of being forced into three
          // preset shapes.
          const ratio = String(item.ratio);
          const ratioNum = item.ratio;
          return (
            <article key={card.slug} className="shrink-0 max-md:w-full">
              {/* The frame clips; the photograph inside it slides. Rendered
                  directly rather than through `Figure` because the image has
                  to be wider than the box it sits in — a cover-fitted image
                  at exactly 100% would show its own edge the moment it
                  moved. */}
              <div
                data-card
                className={`group relative overflow-hidden bg-paper-deep ${FRAME_HEIGHT} aspect-[var(--ar)] max-md:aspect-[4/5] max-md:h-auto max-md:w-full`}
                style={{ "--ar": ratio } as React.CSSProperties}
              >
                <img
                  src={`/img/${card.slug}-1400.webp`}
                  srcSet={item.widths.map((w) => `/img/${card.slug}-${w}.webp ${w}w`).join(", ")}
                  // Worked out per frame rather than declared once. These
                  // frames are sized by height, so each one's width falls out
                  // of its own proportions: a standing picture paints about
                  // 370px wide where the widest paints 950. One vw figure
                  // cannot describe both, and the single 30vw this used to
                  // carry was budgeting 432px for every one of them — so the
                  // browser chose a file two sizes too small for the wide
                  // frames and then stretched it.
                  //
                  // The constants come from the frame heights: about 810px of
                  // a 1440 viewport on desktop, and 354px of 390 on a phone,
                  // which work out to 56vw and 91vw per unit of ratio.
                  sizes={`(max-width: 768px) ${Math.ceil(100 * ratioNum)}vw, ${Math.ceil(78 * ratioNum)}vw`}
                  alt={card.title}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  // No `will-change` here. Nine frames this size each became a
                  // permanent compositor layer, which is the trap GalleryWall
                  // already documents; the browser promotes them while they
                  // are actually moving without being told to.
                  className="absolute top-0 h-full max-w-none object-cover"
                  style={{ width: OVERSIZE, left: `-${PARALLAX}%` }}
                />

                {/* The caption rides on the photograph rather than sitting in
                    a band under it. Underneath, it forced every frame to
                    reserve the same strip of empty paper below itself, which
                    is what made the row read as a row of cards; on the
                    picture, the frames run edge to edge and the section is
                    photographs with their names on them. */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-[clamp(0.9rem,1.4vw,1.4rem)] text-paper">
                  <span>
                    <span className="u-display block text-[clamp(1rem,1.5vw,1.3rem)] leading-none">
                      {card.title}
                    </span>
                    <span className="u-mono mt-1.5 block text-paper/65">{card.meta}</span>
                  </span>
                  <span className="u-mono shrink-0 text-paper/55">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
              </div>
            </article>
          );
        })}

        <div className="flex shrink-0 w-[60vw] items-center justify-center sm:w-[30vw] max-md:col-span-2 max-md:w-full max-md:py-6">
          <Link
            href="/gallery"
            className="group inline-flex flex-col items-center gap-3 text-center"
          >
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-ink/25 transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
              →
            </span>
            <span className="u-mono">View all work</span>
          </Link>
        </div>
        </div>
      </div>

      <div className="mt-[clamp(1.5rem,3vw,2.5rem)] hidden h-px bg-ink/15 md:mx-[var(--gutter)] md:block">
        <div data-bar className="h-px origin-left scale-x-[0.02] bg-ember" />
      </div>
    </section>
  );
}
