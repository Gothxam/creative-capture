# Classy Captures — identity

A redesign, not a trace. Transparent SVG throughout, one colour by default.

## Why it changed

The supplied artwork was a marketplace construction: a literal camera
outline, a sparkle, and a metallic gradient on every element. Three problems
with it as a premium mark —

- **It describes the job instead of standing for the studio.** A camera icon
  says "photographer" the way a tooth says "dentist". Every competitor can
  use it; none of them own it.
- **The sparkle and the gradient date it.** Both are 2010s marketplace
  signatures, and the gradient means it can never be foiled, embossed,
  engraved, embroidered or printed in one colour — which is most of what a
  wedding studio's logo actually has to do.
- **It fought the site.** The rebuilt site is warm linen, ink, enormous
  editorial type and monospace meta, and the references chosen for it
  (gojett, prata, vivmgmt, meech213) are all restrained and typographic. An
  ornate gold camera arriving in that context reads as a different company.

The traced version is still in `../` if it's wanted.

## The mark

Two monoline C's closing on a single point.

- **CC** — the initials, read directly
- **a lens** — concentric apertures stopping down onto a focal point
- **two generations** — the studio's own story; the second C inside the first

No camera, no sparkle, no gradient. It is a circle, two arcs and a dot, which
is why it survives being embossed on a folio, foiled on a card, cut in vinyl
or shown at 32px.

## Files

| | |
|---|---|
| `cc-stacked-*.svg` | Primary lockup. Mark above, name, descriptor. |
| `cc-horizontal-*.svg` | For wide spaces — site header, letterhead, email signature. |
| `cc-monogram-*.svg` | Mark alone. Watermark, social avatar, folio stamp. |
| `cc-monogram-small-*.svg` | Reduced mark — outer C and dot only. **Use below 32px.** |
| `cc-wordmark-*.svg` | Name alone, where the mark already appears nearby. |
| `cc-*-alt-ink.svg` | Alternative mark construction, C's facing apart. Reads more as a lens, less as CC. Kept for reference; not the primary. |
| `singular/` | The same lockups set as "CLASSY CAPTURE" — see the note below. |
| `png/` | Transparent PNGs at three or four widths each, plus favicons at 32/64/180/512. |

Finishes: `-ink` (`#111010`) for light grounds, `-paper` (`#E7E4DD`) for dark
grounds, `-foil` (a restrained champagne gradient) for digital use on dark
only. **The flat versions are primary.** The foil exists because screens
reward it; print should use one colour and let the stock and the finish carry
the richness.

## Rules

**Clear space** — one monogram radius on every side. Nothing enters it.

**Minimum size** — 28mm wide in print, 120px on screen for the stacked
lockup; 20mm / 90px for the horizontal. Below 32px, swap the full monogram
for `cc-monogram-small`: the inner C closes up and turns into a smudge.

**Don't** recolour it outside the three finishes, apply a drop shadow, outline
it, stretch it, set the wordmark in another face, or place the ink version on
a busy photograph — use the paper version with a scrim instead.

## Type

- **Name** — Archivo, weight 800, width 112, tracked +0.015em
- **Descriptor** — JetBrains Mono, weight 500, tracked +0.34em

Both are the site's own typefaces, so the logo and the pages it sits on speak
with one voice. Outlined to paths in the SVGs, so no font is needed to open
or place them. `fonts/` holds static instances cut from the variable fonts
with `fontTools.varLib.instancer`; both are SIL Open Font License.

## A note on the name

The supplied artwork reads **CLASSY CAPTURE**, singular, with the descriptor
"PHOTOGRAPHY AGENCY". Everywhere else — the domain, the site, the copy — the
studio is **Classy Captures**, plural, and describes itself as a wedding
photography and cinematography studio, not an agency.

The primary files use the plural, with "WEDDING PHOTOGRAPHY · BENGALURU".
`singular/` holds the other reading if the artwork is right and the website
is wrong. Worth settling before anything is printed.

## Regenerating

```bash
cd web
node scripts/logo-premium.mjs          # all SVGs
node scripts/logo-premium-export.mjs   # PNGs, favicons, copy into public/brand

# a different name or descriptor:
LOGO_NAME="CLASSY CAPTURE" LOGO_DESCRIPTOR="WEDDING STUDIO · EST. 1995" node scripts/logo-premium.mjs
```

### One thing to know before editing the script

Glyphs are outlined at the origin and positioned with a per-glyph
`transform`, never by passing an offset into `getPath`. opentype.js 2.0.0
emits a **NaN coordinate** from `getPath(x, …)` for certain combinations of
fractional x and fractional size — a single bad control point mid-path, which
makes every renderer silently abandon the rest of the string. It cost half a
descriptor before it was spotted ("WEDDING PHOTOGRA"), and it is invisible
unless you look at the rendered output. Both logo scripts now refuse to write
an SVG containing a non-finite coordinate.
