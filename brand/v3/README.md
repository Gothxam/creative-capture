# Classy Captures — identity

A camera, as asked for. Transparent SVG throughout, one colour by default.

## The mark

**A camera reduced to two elements, with the monogram as its lens.**

- **The body** — one solid silhouette and a single viewfinder step. No
  pentaprism, no hot shoe, no dials.
- **The lens** — a circular void cut out of the body, with the studio's two
  C's standing inside it: the second nested in the first, both mouths cut on
  one vertical.

So the camera and the initials are the same object, not a picture with
letters next to it. The whole thing is one path with three levels of fill —
body solid, lens hole, letters solid again — which means it can be
recoloured, foiled, embossed or knocked out without any part coming adrift.

## Why it looks different to the original

The first artwork wasn't wrong to have a camera. It was wrong to have *that*
camera: a thin outline of a DSLR with a prism, a hot shoe, a sparkle and a
metallic gradient — the same camera on thousands of other photographers'
logos, and a gradient that can never be foiled, embossed, engraved,
embroidered or printed in one colour.

What changed:

| | before | now |
|---|---|---|
| Elements | body, prism, hot shoe, lens, aperture blades, 2 sparkles | body, viewfinder step, lens |
| Weight | hairline outline | solid silhouette |
| Lens | generic aperture | the studio's own monogram |
| Colour | gradient only | one colour, with foil as an option |
| Smallest usable | ~90px | 32px, and a reduced form below that |

Four camera constructions were drawn and compared before this one
(`../explore/_cameras.png`, `_cameras2.png`): a twin-lens reflex, which read
as a remote control; a negative-space seal, which lost the monogram; a focus-
bracket plate, which read as framing rather than as a camera; and this, which
was then tuned across three proportion studies (`_cam-tune.png`).

## Files

| | |
|---|---|
| `cc-stacked-*.svg` | Primary lockup. |
| `cc-horizontal-*.svg` | Site header, letterhead, email signature. |
| `cc-mark-*.svg` | Camera alone — avatar, watermark, folio stamp. |
| `cc-mark-small-*.svg` | Body with a plain lens void. **Use below 32px.** |
| `cc-mark-outline-*.svg` | Drawn rather than solid — embroidery, engraving, light watermarks. |
| `cc-wordmark-*.svg` | Name alone, where the mark is already nearby. |
| `png/` | Transparent PNGs at three or four widths each, plus favicons at 32/64/180/512. |

Finishes: `-ink` `#111010` for light grounds, `-paper` `#E7E4DD` for dark,
`-foil` (champagne gradient) for screens on dark only. **The flat versions
are primary** — print should use one colour and let the stock and the finish
carry the richness.

## Rules

**Clear space** — half the mark's height on every side.

**Minimum size** — 120px / 28mm for the stacked lockup, 90px / 20mm for the
horizontal. Below 32px the two C's inside the lens close up; swap to
`cc-mark-small`.

**Don't** recolour outside the three finishes, add a shadow, stretch it,
reset the wordmark in another face, or put the ink version on a busy
photograph — use the paper version over a scrim.

## Type

- **Name** — Archivo, weight 800, width 112, tracked +0.015em
- **Descriptor** — JetBrains Mono, weight 500, tracked +0.34em

Both are the site's own faces, so the logo and the pages it sits on speak
with one voice. Outlined to paths, so no font is needed to open or place the
files. `../fonts/` holds static instances cut from the variable fonts with
`fontTools.varLib.instancer`; both are SIL OFL.

## A note on the name

The supplied artwork reads **CLASSY CAPTURE**, singular, described as a
"PHOTOGRAPHY AGENCY". Everywhere else — the domain, the site, the copy — it
is **Classy Captures**, plural, a wedding photography and cinematography
studio. These files use the plural. Worth settling before anything is
printed.

## Regenerating

```bash
cd web
node scripts/logo-v3.mjs          # all SVGs
node scripts/logo-v3-export.mjs   # PNGs, favicons, copy into public/brand

LOGO_NAME="CLASSY CAPTURE" LOGO_DESCRIPTOR="WEDDING STUDIO · EST. 1995" node scripts/logo-v3.mjs
```

Geometry lives in `scripts/logo-mark-camera.mjs` (body and lens) and
`scripts/logo-mark.mjs` (the two C's). The lockups only place them — change
the geometry and every file follows.

### Before editing the type

Glyphs are outlined at the origin and positioned with a per-glyph
`transform`, never by passing an offset into `getPath`. opentype.js 2.0.0
emits a **NaN coordinate** from `getPath(x, …)` at certain combinations of
fractional x and fractional size — one bad control point mid-path, which
makes every renderer silently abandon the rest of the string. The build
refuses to write an SVG containing a non-finite coordinate.

## Earlier versions

`../` is the trace of the supplied artwork. `../premium/` and `../v2/` are
the two camera-less attempts — concentric C's, then nested C's. The nested CC
from `../v2/` survives here as the lens.
