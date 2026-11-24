// Builds the Classy Capture logo as SVG.
//
// Everything is geometry or outlined text — no fonts to install, no raster,
// no background. The wordmark is converted to paths with opentype.js so the
// file renders identically anywhere.
//
// Proportions are taken off the supplied artwork, expressed as fractions of
// the camera body so the whole lockup stays in step if the body is resized:
//   body aspect            1.66 : 1
//   roundel diameter       0.90 × body height
//   roundel centre         0.055 × body width right of centre,
//                          0.20 × body height below centre
//   C ring thickness       0.21 × roundel diameter
//   wordmark width         2.10 × body width
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const ROOT = path.resolve(process.cwd(), "..");
const FONTS = path.join(ROOT, "brand", "fonts");
const OUT = path.join(ROOT, "brand");
fs.mkdirSync(OUT, { recursive: true });

// `loadSync` is deprecated in opentype.js 2.x and returns undefined.
const load = (file) => opentype.parse(fs.readFileSync(path.join(FONTS, file)).buffer);

const fonts = {
  300: load("Montserrat-300.ttf"),
  400: load("Montserrat-400.ttf"),
  500: load("Montserrat-500.ttf"),
};

const R = (n) => Math.round(n * 100) / 100;
const rad = (deg) => (deg * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [R(cx + r * Math.cos(rad(deg))), R(cy + r * Math.sin(rad(deg)))];

/* ── text ──────────────────────────────────────────────────────────────── */

/** Natural advance width of `text` at `size`, before tracking. */
function naturalWidth(text, weight, size) {
  const font = fonts[weight];
  const scale = size / font.unitsPerEm;
  let w = 0;
  for (const ch of text) w += font.charToGlyph(ch).advanceWidth * scale;
  return w;
}

/**
 * Outlines `text` with per-character tracking.
 *
 * Each glyph is generated at the origin and placed with its own transform,
 * never by passing an offset into `getPath`. opentype.js 2.0.0 emits a NaN
 * coordinate from `getPath(x, …)` for certain combinations of fractional x
 * and fractional size — one bad control point mid-path, which makes every
 * renderer silently abandon the rest of the string. At x=0 it is always
 * clean.
 */
function outline(text, { weight = 400, size = 100, tracking = 0 }) {
  const font = fonts[weight];
  const scale = size / font.unitsPerEm;
  let x = 0;
  const glyphs = [];
  for (const ch of text) {
    const glyph = font.charToGlyph(ch);
    const d = glyph.getPath(0, 0, size).toPathData(3);
    if (d) glyphs.push({ d, x: R(x) });
    x += glyph.advanceWidth * scale + tracking;
  }
  return { glyphs, width: x - tracking };
}

/** Renders an outlined run at an absolute position. */
const runAt = (run, x, y) =>
  run.glyphs
    .map((g) => `    <path transform="translate(${R(x + g.x)} ${R(y)})" d="${g.d}"/>`)
    .join("\n");

/** Tracking that makes a run land on an exact width. */
function trackingFor(runs, targetWidth, extraGaps = 0) {
  const natural = runs.reduce((n, r) => n + naturalWidth(r.text, r.weight, r.size), 0);
  const gaps = runs.reduce((n, r) => n + [...r.text].length - 1, 0);
  return (targetWidth - extraGaps - natural) / gaps;
}

/* ── geometry ──────────────────────────────────────────────────────────── */

const BODY = { w: 415, h: 250, cx: 500, top: 120, r: 28 };
BODY.left = BODY.cx - BODY.w / 2;
BODY.right = BODY.cx + BODY.w / 2;
BODY.bottom = BODY.top + BODY.h;
BODY.cy = BODY.top + BODY.h / 2;

const STROKE = R(BODY.w * 0.022);

// Top edge: a short flat, the hot shoe step, flat again, then the pentaprism.
const SHOE = { x1: BODY.left + BODY.w * 0.13, x2: BODY.left + BODY.w * 0.28, top: BODY.top - BODY.h * 0.088 };
const PRISM = {
  x1: BODY.left + BODY.w * 0.35,
  x2: BODY.left + BODY.w * 0.76,
  tx1: BODY.left + BODY.w * 0.41,
  tx2: BODY.left + BODY.w * 0.695,
  top: BODY.top - BODY.h * 0.22,
};

const cameraPath = [
  `M ${R(BODY.left + BODY.r)} ${BODY.top}`,
  `L ${R(SHOE.x1)} ${BODY.top} L ${R(SHOE.x1)} ${R(SHOE.top)} L ${R(SHOE.x2)} ${R(SHOE.top)} L ${R(SHOE.x2)} ${BODY.top}`,
  `L ${R(PRISM.x1)} ${BODY.top} L ${R(PRISM.tx1)} ${R(PRISM.top)} L ${R(PRISM.tx2)} ${R(PRISM.top)} L ${R(PRISM.x2)} ${BODY.top}`,
  `L ${R(BODY.right - BODY.r)} ${BODY.top}`,
  `A ${BODY.r} ${BODY.r} 0 0 1 ${R(BODY.right)} ${R(BODY.top + BODY.r)}`,
  `L ${R(BODY.right)} ${R(BODY.bottom - BODY.r)}`,
  `A ${BODY.r} ${BODY.r} 0 0 1 ${R(BODY.right - BODY.r)} ${R(BODY.bottom)}`,
  `L ${R(BODY.left + BODY.r)} ${R(BODY.bottom)}`,
  `A ${BODY.r} ${BODY.r} 0 0 1 ${R(BODY.left)} ${R(BODY.bottom - BODY.r)}`,
  `L ${R(BODY.left)} ${R(BODY.top + BODY.r)}`,
  `A ${BODY.r} ${BODY.r} 0 0 1 ${R(BODY.left + BODY.r)} ${BODY.top}`,
  "Z",
].join(" ");

const ROUND = BODY.h * 0.9; // roundel diameter
const C = {
  cx: R(BODY.cx + BODY.w * 0.055),
  cy: R(BODY.cy + BODY.h * 0.2),
  outer: R(ROUND / 2),
  inner: R(ROUND / 2 - ROUND * 0.21),
  gapDeg: 100,
};

/** Thick ring with a gap on the right and flat-cut terminals. */
function cRing({ cx, cy, outer, inner, gapDeg }) {
  const start = gapDeg / 2;
  const end = 360 - gapDeg / 2;
  const [ox1, oy1] = pt(cx, cy, outer, start);
  const [ox2, oy2] = pt(cx, cy, outer, end);
  const [ix2, iy2] = pt(cx, cy, inner, end);
  const [ix1, iy1] = pt(cx, cy, inner, start);
  return [
    `M ${ox1} ${oy1}`,
    `A ${outer} ${outer} 0 1 1 ${ox2} ${oy2}`,
    `L ${ix2} ${iy2}`,
    `A ${inner} ${inner} 0 1 0 ${ix1} ${iy1}`,
    "Z",
  ].join(" ");
}

// Iris: each blade spans a slice of the outer edge then cuts straight in past
// the centre, which is what gives a real aperture its swirl.
function irisBlades({ cx, cy, r, hole, blades = 6, twist = 24, rotate = -14 }) {
  const step = 360 / blades;
  const out = [];
  for (let i = 0; i < blades; i++) {
    const a0 = rotate + i * step;
    const [x0, y0] = pt(cx, cy, r, a0);
    const [x1, y1] = pt(cx, cy, r, a0 + step);
    const [xh, yh] = pt(cx, cy, hole, a0 + step + twist);
    out.push([`M ${x0} ${y0}`, `A ${r} ${r} 0 0 1 ${x1} ${y1}`, `L ${xh} ${yh}`, "Z"].join(" "));
  }
  return out;
}

const IRIS = { cx: C.cx, cy: C.cy, r: R(C.inner + 2), hole: R(ROUND * 0.07) };

/** Four-point sparkle with concave sides. */
function sparkle(cx, cy, rx, ry, pinch = 0.16) {
  const kx = rx * pinch;
  const ky = ry * pinch;
  return [
    `M ${R(cx)} ${R(cy - ry)}`,
    `Q ${R(cx + kx)} ${R(cy - ky)} ${R(cx + rx)} ${R(cy)}`,
    `Q ${R(cx + kx)} ${R(cy + ky)} ${R(cx)} ${R(cy + ry)}`,
    `Q ${R(cx - kx)} ${R(cy + ky)} ${R(cx - rx)} ${R(cy)}`,
    `Q ${R(cx - kx)} ${R(cy - ky)} ${R(cx)} ${R(cy - ry)}`,
    "Z",
  ].join(" ");
}

const SPARK = sparkle(BODY.right + 34, BODY.top + BODY.h * 0.3, 20, 46);
const SPARK_SM = sparkle(BODY.right + 74, BODY.top + BODY.h * 0.07, 9, 20);

/* ── lockup ────────────────────────────────────────────────────────────── */

const WORD_SIZE = R(BODY.h * 0.275);
const WORD_TARGET = BODY.w * 2.1;
const WORD_GAP = R(WORD_SIZE * 0.5);
const WORD_TRACK = trackingFor(
  [
    { text: "CLASSY", weight: 500, size: WORD_SIZE },
    { text: "CAPTURE", weight: 300, size: WORD_SIZE },
  ],
  WORD_TARGET,
  WORD_GAP,
);
const classy = outline("CLASSY", { weight: 500, size: WORD_SIZE, tracking: WORD_TRACK });
const capture = outline("CAPTURE", { weight: 300, size: WORD_SIZE, tracking: WORD_TRACK });
const WORD_W = classy.width + WORD_GAP + capture.width;
const WORD_X = R(BODY.cx - WORD_W / 2);
const WORD_Y = R(BODY.bottom + BODY.h * 0.42);

const TAG_SIZE = R(BODY.h * 0.088);
const TAG_TARGET = BODY.w * 1.4;
const TAG_TRACK = trackingFor(
  [{ text: "PHOTOGRAPHY AGENCY", weight: 400, size: TAG_SIZE }],
  TAG_TARGET,
);
const tagline = outline("PHOTOGRAPHY AGENCY", { weight: 400, size: TAG_SIZE, tracking: TAG_TRACK });
const TAG_X = R(BODY.cx - tagline.width / 2);
const TAG_Y = R(BODY.bottom + BODY.h * 0.64);

const RULE_Y = R(TAG_Y - TAG_SIZE * 0.36);
const RULE_GAP = 14;
const RULE_LEN = 100;
const RULE_L = { x1: R(TAG_X - RULE_GAP - RULE_LEN), x2: R(TAG_X - RULE_GAP) };
const RULE_R = { x1: R(TAG_X + tagline.width + RULE_GAP), x2: R(TAG_X + tagline.width + RULE_GAP + RULE_LEN) };

/* ── assembly ──────────────────────────────────────────────────────────── */

const GRADIENTS = `
  <defs>
    <linearGradient id="ccMetal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBF1E4"/>
      <stop offset="0.16" stop-color="#F6E3CE"/>
      <stop offset="0.36" stop-color="#C6A484"/>
      <stop offset="0.52" stop-color="#8E7059"/>
      <stop offset="0.68" stop-color="#D8BC9F"/>
      <stop offset="0.86" stop-color="#F7EADB"/>
      <stop offset="1" stop-color="#E4C9AC"/>
    </linearGradient>
    <linearGradient id="ccMetalSoft" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#FDF6EC"/>
      <stop offset="0.3" stop-color="#E2C8AC"/>
      <stop offset="0.55" stop-color="#A98A6D"/>
      <stop offset="0.78" stop-color="#EBD7BF"/>
      <stop offset="1" stop-color="#C9A98A"/>
    </linearGradient>
    <linearGradient id="ccText" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#FBF2E6"/>
      <stop offset="0.55" stop-color="#EBDCC9"/>
      <stop offset="1" stop-color="#D9C3A9"/>
    </linearGradient>
  </defs>`;

const FILLS = {
  metal: {
    mark: "url(#ccMetal)",
    iris: "url(#ccMetalSoft)",
    text: "url(#ccText)",
    rule: "#E6D5BE",
    seam: "#241E1A",
    defs: GRADIENTS,
  },
  // One-colour finishes draw the iris as line art. Filling the blades in the
  // same colour as the ring turns the whole roundel into a solid disc with
  // the seams showing as light slivers — it reads as a splat, not a lens.
  ink: { mark: "#111010", iris: "#111010", text: "#111010", rule: "#111010", seam: "none", outlineIris: true, defs: "" },
  paper: { mark: "#E7E4DD", iris: "#E7E4DD", text: "#E7E4DD", rule: "#E7E4DD", seam: "none", outlineIris: true, defs: "" },
};

function markGroups(f) {
  const blades = irisBlades(IRIS)
    .map((d) => `      <path d="${d}"/>`)
    .join("\n");
  const irisAttrs = f.outlineIris
    ? `fill="none" stroke="${f.iris}" stroke-width="${R(STROKE * 0.42)}" stroke-linejoin="round"`
    : `fill="${f.iris}" stroke="${f.seam}" stroke-width="2.2" stroke-linejoin="round"`;
  return `
  <g fill="none" stroke="${f.mark}" stroke-width="${STROKE}" stroke-linejoin="round" stroke-linecap="round">
    <path d="${cameraPath}"/>
  </g>

  <g fill="${f.mark}">
    <path d="${cRing(C)}"/>
    <path d="${SPARK}"/>
    <path d="${SPARK_SM}"/>
  </g>

  <g ${irisAttrs}>
${blades}
  </g>`;
}

function buildLockup(finish) {
  const f = FILLS[finish];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 580" width="1000" height="580" role="img" aria-label="Classy Capture — Photography Agency">
  <title>Classy Capture</title>${f.defs}
${markGroups(f)}

  <g fill="${f.text}">
${runAt(classy, WORD_X, WORD_Y)}
${runAt(capture, WORD_X + classy.width + WORD_GAP, WORD_Y)}
${runAt(tagline, TAG_X, TAG_Y)}
  </g>

  <!-- Rects, not lines: a horizontal <line> has a zero-height bounding box,
       and an objectBoundingBox gradient on a zero-area box renders nothing. -->
  <g fill="${f.rule}">
    <rect x="${RULE_L.x1}" y="${R(RULE_Y - 1.2)}" width="${R(RULE_L.x2 - RULE_L.x1)}" height="2.4" rx="1.2"/>
    <rect x="${RULE_R.x1}" y="${R(RULE_Y - 1.2)}" width="${R(RULE_R.x2 - RULE_R.x1)}" height="2.4" rx="1.2"/>
  </g>
</svg>
`;
}

function buildMark(finish) {
  const f = FILLS[finish];
  const pad = 14;
  const x = R(BODY.left - pad);
  const y = R(PRISM.top - pad);
  // Right edge follows the outer sparkle, not the body, or the small one
  // gets clipped out of the crop.
  const w = R(BODY.right + 74 + 9 + pad - x);
  const h = R(C.cy + C.outer + pad - y);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Classy Capture">
  <title>Classy Capture mark</title>${f.defs}
${markGroups(f)}
</svg>
`;
}

const files = {
  "classy-capture-logo.svg": buildLockup("metal"),
  "classy-capture-logo-ink.svg": buildLockup("ink"),
  "classy-capture-logo-paper.svg": buildLockup("paper"),
  "classy-capture-mark.svg": buildMark("metal"),
  "classy-capture-mark-ink.svg": buildMark("ink"),
  "classy-capture-mark-paper.svg": buildMark("paper"),
};

for (const [name, svg] of Object.entries(files)) {
  // A single NaN coordinate makes renderers drop the rest of a path without
  // any error, so refuse to write one rather than ship a broken logo.
  if (/NaN|undefined|Infinity/.test(svg)) {
    throw new Error(`${name}: generated SVG contains a non-finite coordinate`);
  }
  fs.writeFileSync(path.join(OUT, name), svg);
  console.log(`${name.padEnd(34)} ${String(svg.length).padStart(6)} bytes`);
}

console.log(
  `\nbody ${BODY.w}×${BODY.h}  roundel ⌀${R(ROUND)}  ring ${R(C.outer - C.inner)}` +
    `  wordmark ${R(WORD_W)} (track ${R(WORD_TRACK)})  tagline ${R(tagline.width)} (track ${R(TAG_TRACK)})`,
);
