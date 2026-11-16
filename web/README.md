# Classy Captures — rebuild

A rebuild of [classycaptures.com](https://classycaptures.com) (WordPress + Elementor) as a
Next.js site, using the studio's own photography, film footage and copy.

**Design references:** [gojett](https://gojett.framer.website/) (giant edge-to-edge display
type, monospace meta, full-bleed editorial photography), [prata](https://prata.framer.website/)
(counting preloader, minimal sticky header, giant footer watermark),
[aperture](https://aperture.framer.media/) (soft reveal choreography, airy spacing),
[meech213](https://www.meech213.com/photo) (the curved arc the selected-work row rides) and
[vivmgmt](https://vivmgmt.com/) (the packed, edge-to-edge gallery wall).

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Styling | Tailwind CSS v4 (tokens in `app/globals.css` via `@theme`) |
| Scroll | [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll |
| Motion | GSAP 3 + ScrollTrigger (`@gsap/react`'s `useGSAP`) |
| Fonts | Archivo (display, variable width), Instrument Serif (accent), JetBrains Mono (meta) |

## Running it

```bash
npm install
npm run dev
```

```bash
npm run build && npx next start -p 3100
```

## Deploying

### Shared hosting (cPanel, FTP — no Node)

```bash
npm run build:static
```

That emits `out/` — 225 files, **18.3 MB**, plain HTML/CSS/JS. Upload the *contents* of
`out/` to your web root (usually `public_html`). Nothing else is needed: no Node, no
`npm install` on the server, no process to keep alive.

It works because every route prerenders — there are no route handlers, no cookies and no
dynamic params, and the enquiry form posts from the browser to an external endpoint. Static
export does not support `redirects()` or `headers()` from `next.config.ts`, so those rules
live in `public/.htaccess`, which Next copies verbatim into `out/`. It carries the old
WordPress redirects, cache headers, HTTPS forcing and gzip. **If your host is nginx rather
than Apache, `.htaccess` is ignored** and those rules need translating into the server block.

### A Node host (Vercel, Netlify, a VPS)

```bash
npm run build && npm run start
```

Preferred if it's an option: `next start` honours `redirects()` and `headers()` directly, so
`.htaccess` is irrelevant, and you get on-demand image optimisation.

### What is NOT in the repository

`assets/` — 1.3 GB of camera originals scraped from the old site, two of them over GitHub's
hard 100 MB per-file limit. They are gitignored and live only on the machine that scraped
them, so **keep a separate backup**. The site ships the optimised derivatives in
`web/public` (17 MB), which *are* committed; `scripts/curate.mjs` and `scripts/video.mjs`
regenerate them from the originals.

## Design system

Concept: **the archive** — warm archival paper, ink-black editorial type set enormous,
monospace catalogue numbers, and photographs that arrive like prints laid on a light table.
All colour comes from the photography; the page itself is paper, ink and one ember accent.

| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#E7E4DD` | page ground |
| `--color-paper-dim` | `#DAD6CD` | recessed bands |
| `--color-ink` | `#111010` | type, dark sections, the loader |
| `--color-ember` | `#C0351A` | labels, accents, progress |
| `--color-flame` | `#DD4318` | the loader counter and rule |
| `--color-gold` | `#B4873F` | reserved secondary |

The ground is a cool linen rather than the warm cream it started as. The
photography is almost entirely warm — marigold, sindoor, gold, skin — so a
cooler, slightly deeper ground pushes those colours forward instead of
blending with them, and lets the accent run hotter.

Ember stays deeper than flame because it carries small mono labels on paper,
where contrast matters more than punch; the loader is a flat dark field where it
doesn't.

The footer is **ink**, not flame. A full-bleed orange field was the loudest thing
on a site whose whole argument is that the photographs carry the colour — it read
as a different brand arriving at the bottom of the page. Ink ties it to the other
dark sections and lets the wordmark do the shouting.

Type scale is driven by `BleedText`, which **measures** a line and sizes it to span its
container exactly, so headlines sit flush to both gutters at any viewport width rather than
relying on a `vw` guess.

## Animation

Every requested behaviour, and where it lives:

| Behaviour | Component |
|---|---|
| **Loader** — ink sheet, counter to 100 with a flame rule filling the foot, then four columns fall away from the right | `components/Loader.tsx` |
| **Scroll reveal** — line, word and element masks throughout | `primitives/MaskText.tsx`, `primitives/Reveal.tsx` |
| **Horizontal scroll** — pinned track, scroll-linked, with counter and progress bar | `sections/HorizontalWork.tsx` |
| **Storytelling** — pinned three-beat sequence, text and images cross-fading in place. Deliberately flat; a 3D turn was tried and read as fussy against the stillness the copy describes | `sections/StoryScroll.tsx` |
| **Arc carousel** — the selected-work frames ride a circular arc, dropping along the curve and rotating to stay tangent to it, so the row bows like film laid over a drum | `sections/HorizontalWork.tsx` |
| **Semi-3D** — pointer-driven card tilt, with labels pushed forward in Z | `primitives/Tilt.tsx`, `sections/FilmStrip.tsx` |
| **Semi-3D** — footer wordmark lies back and tilts upright on arrival | `components/Footer.tsx` |
| Scroll-driven colour fill on the philosophy statement — a typographic pause with no photograph, the one place the studio speaks rather than shows | `sections/Philosophy.tsx` |
| Editorial collage for the collection pages — varied slot sizes, printed paper frames, deliberate offsets | `sections/CollectionGrid.tsx` |
| Packed gallery wall — columns travelling at five different rates, leaning toward the pointer, rising in on arrival | `sections/GalleryWall.tsx` |
| Image wipe-in + parallax | `primitives/Figure.tsx` |
| Infinite ticker, direction tied to scroll | `primitives/Marquee.tsx` |
| Cursor-following service previews | `sections/ServicesList.tsx` |
| Magnetic button — written, currently unused since the CTA section was folded into the footer | `primitives/Magnetic.tsx` |
| Counting statistics | `sections/Stats.tsx` |
| Viewport-gated video playback | `sections/FilmStrip.tsx`, `sections/FilmHero.tsx` |

All 3D is transform-only (`rotateX`/`rotateY`/`z` against a parent `perspective`), so it
stays on the compositor. No WebGL, no extra runtime.

### The gallery wall, and what the reference actually does

`scripts/probe-viv2.mjs` measures the reference (vivmgmt.com) rather than guessing at it.
Run it and it reports:

- The page **does not scroll natively at all** — `body` is `overflow: hidden` and the
  document height equals the viewport height, so `window.scrollTo` and wheel events move
  nothing.
- The whole wall is one wrapper translated on X, and that X **follows the pointer**: cursor
  at the left edge put it at `-41px`, cursor at the right edge at `-380px`.
- Each tile carries its own Y offset on arrival (65px, 56px, 0 …) which settles to 0 after
  a couple of seconds — a staggered entrance, not a scroll effect.

Taking native scrolling away from a site whose job is to be read, linked and shared is not
a trade worth making, so `GalleryWall` keeps the page scrolling normally and puts the same
three ideas on top of it: columns travelling at five different rates so the wall shears as
you scroll, a pointer lean of ±23px, and a staggered column entrance.

Columns are explicit elements rather than CSS `columns`, because each has to be transformed
independently — and transforming five columns costs far less than transforming the
forty-odd photographs inside them. Column count steps 2 → 3 → 4 → 5 with the viewport;
items are distributed greedily by accumulated height so the columns come out level.

### The footer

Modelled on the Velour studio screenshot supplied as a reference: a ticker band of monogram
marks, bracketed meta and a pill, then **LET'S WORK TOGETHER ↗** with the links top-right,
the contact row, and the wordmark set edge-to-edge and cropped by the bottom of the page.

It sits on **ink**. The reference's full-bleed orange was tried and pulled: on a site whose
whole argument is that the photographs carry the colour, an orange field was the loudest
thing on the page and read as a different brand arriving at the bottom. Ink keeps the
structure and the scale of the reference while tying the footer to the other dark sections.

Because the footer *is* the call to action, there is no separate closing CTA section on any
page.

### Three things worth knowing

**Reveal targets are pre-hidden in CSS**, not by JavaScript, so nothing flashes before
hydration. A `<noscript>` block restores them when scripting is off.

**Masked text pins `y: 0` at both ends of its tween.** The hidden state is
`transform: translate3d(0,110%,0)` in CSS; GSAP reads that existing transform on init and
banks it as a base `y` offset in pixels. Animating `yPercent` alone then runs *on top of* that
base and the tween finishes back exactly where it started — headlines that never appear. See
the note in `primitives/MaskText.tsx` before changing it.

**Scroll smoothness is a measured property, not a vibe.** Three things were each costing a
chunk of the frame budget and have been removed: a grain overlay using `mix-blend-mode`
(a blend mode re-composites its whole stacking context every scrolled frame — grain now
rides along in the body's own paint), one `filter: blur()` placeholder per figure (now a CSS
background), and `backdrop-filter` on the nav. Scroll-reactive pieces read position from a
single `ScrollTrigger` per frame rather than each adding its own `scroll` listener.

Before: **22.4% of frames dropped, p90 33.3ms.** After: **4.3%, p90 16.7ms.**
Re-measure with `node scripts/perf.mjs` and attribute regressions with
`node scripts/perf-ablate.mjs`. Avoid blend modes, `backdrop-filter`, and animating `scale`
on large text — all three force re-rasterization on every frame.

Pinned sections degrade to plain stacked layouts below `768px`, where pinning fights the
mobile address bar. `prefers-reduced-motion` disables Lenis and collapses every reveal.

## Media pipeline

The scraped originals (`../assets`, 1.3 GB) are never shipped. Three scripts derive what is:

```bash
node scripts/curate.mjs       # 43 curated photographs -> public/img + lib/media.generated.ts
node scripts/video.mjs        # 5 muted, loopable clips + poster frames -> public/video
node scripts/contact-sheet.mjs # labelled sheets of the full library, for re-curating
```

| | Before | After |
|---|---|---|
| Images | 469 MB (88 files, up to 14.5 MB each) | **11 MB** (43 photographs × 4 widths, WebP) |
| Video | 856 MB (8 files, one 439 MB) | **6.2 MB** (5 clips, CRF 30) |

Clips that play large are encoded at full width (`film-ceremony` — the home hero — and
`film-teaser`, the films showreel). The rest render three-up at roughly 380px and are cut to
640px: decoding three 1120px streams at once cost frames on scroll for detail invisible at
that size. `hero-loop.mp4` stays in the pipeline as an alternative hero source but nothing
references it today.

`lib/media.generated.ts` is written by `curate.mjs` — edit `PICKS` in that script, not the
manifest. Each entry carries its aspect ratio, available widths and an inline blur
placeholder. `Figure` builds the `srcset` from it.

## Content

`lib/content.ts` holds every word. The studio's own copy is carried over from the live site.
Two places are newly written and should be reviewed before launch:

- **Services** — the live `/services` page has headings and no body text at all, so the
  summaries, detail paragraphs and "includes" lists are new.
- **Storytelling beats** on the home page, and the collection page intros for
  `/pre-wedding` and `/portraits`.

Statistics in `HOME.stats` (900+ weddings, 2 generations) are **placeholders** — confirm them
with the studio.

## Fixes carried over from the audit

- `/potraits` → `/portraits`, and `/contact-us` → `/contact`, as permanent redirects in
  `next.config.ts`, so existing links and indexed URLs still land (see `../SITE-ANALYSIS.md`).
- The old `/contact` page shipped Astra starter-template dummy data (`hello@tyler.com`, a San
  Diego address). It does not exist here.
- Page titles and descriptions are per-page and keyword-bearing, replacing
  "Home - classycaptures.com".

## The enquiry form

`components/sections/ContactForm.tsx` posts JSON to `NEXT_PUBLIC_FORM_ENDPOINT` when one is
set (Formspree, Basin, or your own handler). **With no endpoint configured it falls back to
opening a pre-filled email** to the studio, so it is never a dead end — but set one before
launch:

```bash
# .env.local
NEXT_PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

## QA

```bash
npm run build && npx next start -p 3100   # audit runs against a production build

node scripts/audit.mjs desktop   # every route, scrolled end to end
node scripts/audit.mjs mobile
```

The audit walks all nine routes, reports any reveal still stuck hidden, any horizontal
overflow and any console error. Last run: **all routes clean, both widths.**

```bash
node scripts/shots.mjs / desktop 8        # screenshot sweep -> ../scrape/shots
node scripts/sheet.mjs desktop-home       # contact sheet of that sweep
```

### Scroll performance

```bash
node scripts/perf.mjs /           # frame deltas over a steady full-page scroll
node scripts/perf-ablate.mjs      # re-runs it with one suspected cost disabled at a time
```

`perf.mjs` reports frame-time percentiles and buckets the dropped frames by scroll
depth, so jank can be attributed to a section instead of guessed at. `perf-ablate.mjs`
is how the causes below were found — measure before changing anything here.

| | p90 frame | dropped frames |
|---|---|---|
| Before | 33.3 ms | 22.4% |
| After | **16.7 ms** | **2.5%** |

Three things were responsible, in order:

1. **Grain.** Originally a per-section `::after` with `mix-blend-mode: multiply`. A blend
   mode re-composites its whole stacking context every scrolled frame. Moving it to a
   fixed full-viewport overlay was no better — that is a viewport-sized layer above
   scrolling content. It now rides in the body's own paint: no extra layer, no blend.
2. **Blurred placeholders.** One `filter: blur()` element per figure, ~40 of them
   repainting on scroll. They are CSS backgrounds now; an 18px source scaled to cover is
   already soft, so the filter bought nothing.
3. **`backdrop-filter` on the header**, which repaints the strip behind the bar every
   frame. A near-opaque fill reads the same.

Also: grid video clips were cut from 1120px to 640px (three simultaneous decodes at
~380px display), parallax was dropped from the dense collection grids, the per-component
`scroll` listeners were folded into shared ScrollTriggers, and the two elements carrying
scrubbed 3D transforms — the hero frame and the footer wordmark stage — are explicitly
promoted with `will-change: transform`. Lenis runs on `lerp` rather than `duration`, so
the glide is frame-rate independent and reacts to a new wheel event immediately.

### What the 3D work cost, and how it was paid for

Adding the arc carousel, the dealt print stack and the tilted collage put the home page
back to 27% dropped frames and held `/weddings` at a 30fps median. Three more
measurements, each counter-intuitive enough to be worth recording:

1. **`transform-style: preserve-3d` is expensive.** Sharing one perspective across the
   carousel meant every element between the wrapper and the rotated frame had to carry
   `preserve-3d`, which keeps the whole subtree out of its own compositor layer.
   Flattening it halved the dropped frames. Each frame now carries its **own**
   perspective, so the rotated element is a direct child and nothing in between needs it.
2. **A full-size overlay inside a 3D subtree costs as much as the 3D.** The dimming
   `<div>` over each edge card was as expensive as the rotation itself. Removed — the
   rotation and Z-depth already read as depth without it.
3. **A static rotation on a large image is not free, and `will-change` makes it worse.**
   A 1–2° tilt on each photograph in the collection grid forced a re-rasterise of that
   photograph on every scrolled frame: `/weddings` went from 44% dropped frames to **0%**
   with the tilt removed. Promoting the frames to their own layers instead took it to
   71% — nineteen large layers cost more than they save. The tilt now applies only to the
   small printed frames, where the pixel area is a fraction of the size.

| | p90 frame | dropped frames |
|---|---|---|
| Home | 16.8 ms | 3.2% |
| `/weddings`, `/portraits` | 16.7 ms | 0% |

Note that headless Chromium composites in software, so the absolute numbers are
pessimistic against a real GPU; the ranking between variants is what matters.

`playwright` and `ffmpeg-static` are devDependencies, used only by these scripts.
