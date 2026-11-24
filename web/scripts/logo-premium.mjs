// Classy Captures — identity system.
//
// A redesign rather than a trace. The supplied artwork was a marketplace
// construction: a literal camera outline, a sparkle and a metallic gradient,
// none of which sit with the studio's own register — thirty years, two
// generations, South Indian weddings — or with the editorial site built
// around it.
//
// The mark here is two monoline C's around a single point.
//   · CC, the initials
//   · a lens: concentric apertures closing on a focal point
//   · two generations of the studio, facing each other across one subject
//
// It is one colour, has no gradient, no camera and no sparkle, and holds its
// shape down to a 16px favicon.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const ROOT = path.resolve(process.cwd(), "..");
const FONTS = path.join(ROOT, "brand", "fonts");
const OUT = path.join(ROOT, "brand", "premium");
fs.mkdirSync(OUT, { recursive: true });

const load = (file) => opentype.parse(fs.readFileSync(path.join(FONTS, file)).buffer);
const DISPLAY = load("Archivo-800x112.ttf");
const MONO = load("JetBrainsMono-500.ttf");

const R = (n) => Math.round(n * 100) / 100;
const rad = (d) => (d * Math.PI) / 180;
const pt = (cx, cy, r, d) => [R(cx + r * Math.cos(rad(d))), R(cy + r * Math.sin(rad(d)))];

/* ── type ──────────────────────────────────────────────────────────────── */

const natural = (text, font, size) => {
  const s = size / font.unitsPerEm;
  let w = 0;
  for (const ch of text) w += font.charToGlyph(ch).advanceWidth * s;
  return w;
};

/** Size at which `text` fills `target` once tracking (in em) is applied. */
function fitSize(text, font, target, trackEm) {
  const unit = natural(text, font, 1);
  const gaps = [...text].length - 1;
  return target / (unit + trackEm * gaps);
}

/**
 * Outlines a run of text.
 *
 * Each glyph is generated at the origin and placed with its own transform,
 * never by passing an offset into `getPath`. opentype.js 2.0.0 emits a NaN
 * coordinate from `getPath(x, …)` for certain combinations of fractional x
 * and fractional size — one bad control point mid-path, which makes every
 * renderer silently abandon the rest of the string. At x=0 it is always
 * clean.
 */
function outline(text, font, size, trackEm) {
  const track = trackEm * size;
  let x = 0;
  const glyphs = [];
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    const d = g.getPath(0, 0, size).toPathData(3);
    if (d) glyphs.push({ d, x: R(x) });
    x += (g.advanceWidth * size) / font.unitsPerEm + track;
  }
  return { glyphs, width: x - track, size };
}

/** Renders an outlined run at an absolute position. */
const runAt = (run, x, y) =>
  run.glyphs
    .map((g) => `    <path transform="translate(${R(x + g.x)} ${R(y)})" d="${g.d}"/>`)
    .join("\n");

const capHeight = (font, size) => (font.tables.os2.sCapHeight / font.unitsPerEm) * size;

/* ── the mark ──────────────────────────────────────────────────────────── */

const MARK = {
  outerR: 104, // centreline radius of the outer C
  innerR: 60, // centreline radius of the inner C
  weight: 21, // stroke weight of both
  gap: 64, // opening, in degrees
  dot: 10.5,
};
const EDGE = MARK.outerR + MARK.weight / 2; // outermost extent

/** Ring segment with flat terminals, cut square to the radius. */
function arcBar(cx, cy, rMid, weight, gapDeg, centreDeg) {
  const ro = rMid + weight / 2;
  const ri = rMid - weight / 2;
  const a0 = centreDeg + gapDeg / 2;
  const a1 = centreDeg + 360 - gapDeg / 2;
  const large = a1 - a0 > 180 ? 1 : 0;
  const [ox0, oy0] = pt(cx, cy, ro, a0);
  const [ox1, oy1] = pt(cx, cy, ro, a1);
  const [ix1, iy1] = pt(cx, cy, ri, a1);
  const [ix0, iy0] = pt(cx, cy, ri, a0);
  return [
    `M ${ox0} ${oy0}`,
    `A ${ro} ${ro} 0 ${large} 1 ${ox1} ${oy1}`,
    `L ${ix1} ${iy1}`,
    `A ${ri} ${ri} 0 ${large} 0 ${ix0} ${iy0}`,
    "Z",
  ].join(" ");
}

/**
 * @param {"facing"|"aligned"} variant
 *  facing  — the C's open away from each other; reads as a lens iris
 *  aligned — both open right; reads more literally as "CC"
 */
function markPaths(cx, cy, variant = "aligned") {
  const innerCentre = variant === "facing" ? 180 : 0;
  return [
    arcBar(cx, cy, MARK.outerR, MARK.weight, MARK.gap, 0),
    arcBar(cx, cy, MARK.innerR, MARK.weight, MARK.gap, innerCentre),
  ];
}

function markGroup(cx, cy, fill, variant = "aligned") {
  const [outer, inner] = markPaths(cx, cy, variant);
  return `  <g fill="${fill}">
    <path d="${outer}"/>
    <path d="${inner}"/>
    <circle cx="${R(cx)}" cy="${R(cy)}" r="${MARK.dot}"/>
  </g>`;
}

/** Reduced mark for very small sizes: outer ring and dot only. */
function markGroupSmall(cx, cy, fill) {
  return `  <g fill="${fill}">
    <path d="${arcBar(cx, cy, MARK.outerR, MARK.weight * 1.25, MARK.gap, 0)}"/>
    <circle cx="${R(cx)}" cy="${R(cy)}" r="${MARK.dot * 1.9}"/>
  </g>`;
}

/* ── words ─────────────────────────────────────────────────────────────── */

const NAME = process.env.LOGO_NAME ?? "CLASSY CAPTURES";
const DESCRIPTOR = process.env.LOGO_DESCRIPTOR ?? "WEDDING PHOTOGRAPHY · BENGALURU";

const WORD_TRACK = 0.015; // tight; the display face is already wide
const TAG_TRACK = 0.34; // mono, set wide as a rule of small caps

const PALETTE = {
  ink: { fg: "#111010", defs: "" },
  paper: { fg: "#E7E4DD", defs: "" },
  foil: {
    fg: "url(#ccFoil)",
    defs: `
  <defs>
    <linearGradient id="ccFoil" x1="0" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#F3E3CB"/>
      <stop offset="0.45" stop-color="#C9A579"/>
      <stop offset="0.72" stop-color="#8A6A49"/>
      <stop offset="1" stop-color="#E8D2B2"/>
    </linearGradient>
  </defs>`,
  },
};

const svg = (w, h, body, defs, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}">
  <title>${label}</title>${defs}
${body}
</svg>
`;

/* ── lockups ───────────────────────────────────────────────────────────── */

function stacked(finish, variant = "aligned") {
  const p = PALETTE[finish];
  const W = 900;
  const PAD = 60;

  const markCx = W / 2;
  const markCy = PAD + EDGE;

  const wordTarget = 560;
  const wordSize = fitSize(NAME, DISPLAY, wordTarget, WORD_TRACK);
  const word = outline(NAME, DISPLAY, wordSize, WORD_TRACK);
  const wordCap = capHeight(DISPLAY, wordSize);
  const wordBaseline = markCy + EDGE + 72 + wordCap;

  const tagTarget = 440;
  const tagSize = fitSize(DESCRIPTOR, MONO, tagTarget, TAG_TRACK);
  const tag = outline(DESCRIPTOR, MONO, tagSize, TAG_TRACK);
  const tagBaseline = wordBaseline + 54;

  const H = Math.round(tagBaseline + PAD);

  const body = `${markGroup(markCx, markCy, p.fg, variant)}

  <g fill="${p.fg}">
${runAt(word, W / 2 - word.width / 2, wordBaseline)}
${runAt(tag, W / 2 - tag.width / 2, tagBaseline)}
  </g>`;

  return svg(W, H, body, p.defs, `${NAME} — ${DESCRIPTOR}`);
}

function horizontal(finish, variant = "aligned") {
  const p = PALETTE[finish];
  const PAD = 56;
  const markCx = PAD + EDGE;
  const markCy = PAD + EDGE;

  const wordTarget = 520;
  const wordSize = fitSize(NAME, DISPLAY, wordTarget, WORD_TRACK);
  const word = outline(NAME, DISPLAY, wordSize, WORD_TRACK);
  const wordCap = capHeight(DISPLAY, wordSize);

  const tagSize = fitSize(DESCRIPTOR, MONO, wordTarget * 0.84, TAG_TRACK);
  const tag = outline(DESCRIPTOR, MONO, tagSize, TAG_TRACK);

  const textX = markCx + EDGE + 54;
  // Optically centre the two text lines on the mark.
  const block = wordCap + 30 + tagSize * 0.72;
  const wordBaseline = markCy - block / 2 + wordCap;
  const tagBaseline = wordBaseline + 30 + tagSize * 0.72;

  const W = Math.round(textX + Math.max(word.width, tag.width) + PAD);
  const H = Math.round(markCy + EDGE + PAD);

  const body = `${markGroup(markCx, markCy, p.fg, variant)}

  <g fill="${p.fg}">
${runAt(word, textX, wordBaseline)}
${runAt(tag, textX, tagBaseline)}
  </g>`;

  return svg(W, H, body, p.defs, `${NAME} — ${DESCRIPTOR}`);
}

function monogram(finish, variant = "aligned", small = false) {
  const p = PALETTE[finish];
  const PAD = 18;
  const size = Math.round((EDGE + PAD) * 2);
  const c = size / 2;
  const body = small ? markGroupSmall(c, c, p.fg) : markGroup(c, c, p.fg, variant);
  return svg(size, size, body, p.defs, NAME);
}

function wordmarkOnly(finish) {
  const p = PALETTE[finish];
  const PAD = 40;
  const wordSize = fitSize(NAME, DISPLAY, 720, WORD_TRACK);
  const word = outline(NAME, DISPLAY, wordSize, WORD_TRACK);
  const cap = capHeight(DISPLAY, wordSize);
  const W = Math.round(word.width + PAD * 2);
  const H = Math.round(cap + PAD * 2);
  const body = `  <g fill="${p.fg}">
${runAt(word, PAD, PAD + cap)}
  </g>`;
  return svg(W, H, body, p.defs, NAME);
}

/* ── write ─────────────────────────────────────────────────────────────── */

const files = {};
for (const finish of ["ink", "paper", "foil"]) {
  files[`cc-stacked-${finish}.svg`] = stacked(finish);
  files[`cc-horizontal-${finish}.svg`] = horizontal(finish);
  files[`cc-monogram-${finish}.svg`] = monogram(finish);
  files[`cc-monogram-small-${finish}.svg`] = monogram(finish, "aligned", true);
  files[`cc-wordmark-${finish}.svg`] = wordmarkOnly(finish);
}
// The alternative mark construction (C's facing away), kept for comparison.
files["cc-monogram-alt-ink.svg"] = monogram("ink", "facing");
files["cc-stacked-alt-ink.svg"] = stacked("ink", "facing");

for (const [name, data] of Object.entries(files)) {
  // A single NaN coordinate makes renderers drop the rest of a path without
  // any error, so refuse to write one rather than ship a logo with half a
  // word missing.
  if (/NaN|undefined|Infinity/.test(data)) {
    throw new Error(`${name}: generated SVG contains a non-finite coordinate`);
  }
  fs.writeFileSync(path.join(OUT, name), data);
}
console.log(`${Object.keys(files).length} files -> brand/premium`);
console.log(`name "${NAME}"   descriptor "${DESCRIPTOR}"`);
