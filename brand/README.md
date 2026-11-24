# Classy Capture — logo

A vector rebuild of the supplied logo artwork. Every file has a **transparent
background** — there is no canvas rect and no baked-in colour behind the mark.

## Files

| File | Use |
|---|---|
| `classy-capture-logo.svg` | Full lockup, metallic champagne gradient. For dark backgrounds. |
| `classy-capture-logo-ink.svg` | Full lockup, single colour `#111010`. For light backgrounds. |
| `classy-capture-logo-paper.svg` | Full lockup, single colour `#E7E4DD`. For dark backgrounds, one colour. |
| `classy-capture-mark.svg` | Camera + aperture-C only, metallic. |
| `classy-capture-mark-ink.svg` | Mark only, single colour dark. |
| `classy-capture-mark-paper.svg` | Mark only, single colour light. |
| `png/` | Rasterised at 600 / 1200 / 2400px (lockup) and 256 / 512 / 1024px (mark), all transparent. |
| `png/favicon-*.png` | Square, padded, on ink — 64 / 180 / 512px. |

The same SVGs are copied into `web/public/brand/` so the site can reference
them directly.

## How it's built

```bash
cd web
node scripts/logo.mjs          # regenerates every SVG
node scripts/logo-export.mjs   # rasterises to PNG and copies into public/brand
```

`scripts/logo.mjs` draws the mark from geometry and converts the wordmark to
outlines with opentype.js, so the files carry **no font dependency** — they
render identically anywhere, including in design tools that don't have
Montserrat installed.

### Proportions

Everything is expressed as a fraction of the camera body, so changing
`BODY` in the script rescales the whole lockup in step:

| | |
|---|---|
| Body aspect | 1.66 : 1 |
| Outline weight | 0.022 × body width |
| Roundel diameter | 0.90 × body height |
| Roundel centre | 0.055 × body width right of centre, 0.20 × body height below it |
| C ring thickness | 0.21 × roundel diameter |
| C opening | 100°, facing right, flat-cut terminals |
| Wordmark width | 2.10 × body width |
| Wordmark baseline | 0.42 × body height below the body |

Tracking isn't a fixed value — `trackingFor()` solves for the spacing that
lands each run on its exact target width, so the wordmark and the tagline
stay optically aligned with the mark at any size.

### Two things worth knowing before editing

**The one-colour variants draw the aperture as line art, not filled blades.**
Filling the blades in the same colour as the C turns the whole roundel into a
solid disc with the seams showing as thin light slivers — it reads as a splat
rather than a lens. Only the metallic variant fills them, because there the
blades and the ring carry different gradients.

**The rules either side of the tagline are `<rect>`s, not `<line>`s.** A
horizontal line has a zero-height bounding box, and an `objectBoundingBox`
gradient on a zero-area box renders nothing at all — the rules were silently
invisible until they became rects with a solid fill.

## Type

The wordmark is Montserrat — Medium (500) for CLASSY, Light (300) for
CAPTURE, Regular (400) for the tagline. `fonts/` holds static instances cut
from the variable font with `fontTools.varLib.instancer`; Montserrat is
licensed under the SIL Open Font License.

## Colour

The metallic gradient runs champagne → warm shadow → highlight:

```
#FBF1E4 → #F6E3CE → #C6A484 → #8E7059 → #D8BC9F → #F7EADB → #E4C9AC
```

The flat variants use the site's own tokens: `#111010` (ink) and `#E7E4DD`
(paper).
