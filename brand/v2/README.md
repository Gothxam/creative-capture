# Classy Captures — identity

Transparent SVG throughout, one colour by default.

## The mark

**Two C's, the second set inside the first, both mouths cut on one vertical.**

It reads three ways:

- **CC** — the initials, directly
- **a lens stopping down** — one aperture inside the next
- **two generations** — the younger working inside the elder's frame, which
  is the actual shape of this studio

The detail that makes it look drawn rather than assembled is the shared cut
line. Each C's mouth angle is *derived* from where a single vertical crosses
its own circle, not set by eye — so the two openings finish on one edge even
though the circles differ in size and centre.

## How it got here

The first attempt was a trace of the supplied artwork (still in `../`). The
second was a pair of concentric C's around a dot (`../premium/`) — safe, and
fairly called out as not creative: concentric rings with a centre dot is a
shape, not an idea.

So four directions were drawn and judged side by side (`../explore/`):

| | |
|---|---|
| **the knot** | A wedding is a knot being tied; a two-generation studio is a line that hasn't broken. |
| **the kolam** | The looping line drawn around a dot grid at a South Indian threshold, and at weddings. |
| **the threshold** | A C turned ninety degrees is an arch — the toran a couple marries under. |
| **the unbroken line** | One stroke turning back through itself. |

The kolam was the most interesting idea and the weakest mark — four
overlapping circles read as generic sacred geometry and said nothing about
the studio. The threshold read as a rainbow. The unbroken line read as a
mistake.

The knot was right, and then the geometry refused it. Two C's facing the same
way **cannot** weave: the left one's opening faces the right one's back, so
their strokes never cross. Turning one around to make them cross produces the
symmetric two-ring interlock — which reads as a figure-eight and sits far too
close to a certain fashion monogram. Making the second C smaller fixed the
symmetry, but at that size relationship the small circle sits *wholly inside*
the large one, so there is nothing to weave at all; forcing a crossing meant
pushing it out until its mouth gaped, and the over/under notch read as a chip
out of the large C rather than as a knot.

Nested is what survived. It is cleaner than the knot would have been and says
the same thing with one fewer trick.

## Files

| | |
|---|---|
| `cc-stacked-*.svg` | Primary lockup. |
| `cc-horizontal-*.svg` | Site header, letterhead, email signature. |
| `cc-monogram-*.svg` | Mark alone — watermark, avatar, folio stamp. |
| `cc-monogram-small-*.svg` | Outer C alone, slightly heavier. **Use below 32px.** |
| `cc-wordmark-*.svg` | Name alone, where the mark is already nearby. |
| `png/` | Transparent PNGs at three or four widths each, plus favicons. |

Finishes: `-ink` `#111010` for light grounds, `-paper` `#E7E4DD` for dark,
`-foil` (champagne gradient) for screens on dark only. **The flat versions
are primary** — print should use one colour and let the stock and the finish
carry the richness.

## Rules

**Clear space** — half the mark's height on every side.

**Minimum size** — 120px / 28mm for the stacked lockup, 90px / 20mm for the
horizontal. Below 32px the inner C closes up; swap to `cc-monogram-small`.

**Don't** recolour outside the three finishes, add a shadow, outline it,
stretch it, reset the wordmark in another face, or put the ink version on a
busy photograph — use the paper version over a scrim.

## Type

- **Name** — Archivo, weight 800, width 112, tracked +0.015em
- **Descriptor** — JetBrains Mono, weight 500, tracked +0.34em

Both are the site's own faces. Outlined to paths in the SVGs, so no font is
needed to open or place them. `../fonts/` holds static instances cut from the
variable fonts with `fontTools.varLib.instancer`; both are SIL OFL.

## A note on the name

The supplied artwork reads **CLASSY CAPTURE**, singular, described as a
"PHOTOGRAPHY AGENCY". Everywhere else — the domain, the site, the copy — it
is **Classy Captures**, plural, a wedding photography and cinematography
studio. These files use the plural. Worth settling before anything is
printed.

## Regenerating

```bash
cd web
node scripts/logo-v2.mjs          # all SVGs
node scripts/logo-v2-export.mjs   # PNGs, favicons, copy into public/brand

LOGO_NAME="CLASSY CAPTURE" LOGO_DESCRIPTOR="WEDDING STUDIO · EST. 1995" node scripts/logo-v2.mjs
```

The mark's geometry lives in `scripts/logo-mark.mjs`; the lockups only place
it. Change `GEOM` there and every lockup follows.

### Before editing the type

Glyphs are outlined at the origin and positioned with a per-glyph
`transform`, never by passing an offset into `getPath`. opentype.js 2.0.0
emits a **NaN coordinate** from `getPath(x, …)` at certain combinations of
fractional x and fractional size — one bad control point mid-path, which
makes every renderer silently abandon the rest of the string. It ate half a
descriptor before it was caught. The build refuses to write an SVG containing
a non-finite coordinate.
