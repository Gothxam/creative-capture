// Classy Captures — identity, v2.
//
// Mark: see logo-mark.mjs. Type: Archivo for the name, JetBrains Mono for
// the descriptor — the site's own faces, so the logo and the pages it sits
// on speak with one voice. Outlined to paths, so no font is needed to open
// or place the files.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { markPaths, markSmallPaths, MARK_BOX, R } from "./logo-mark.mjs";

const ROOT = path.resolve(process.cwd(), "..");
const FONTS = path.join(ROOT, "brand", "fonts");
const OUT = path.join(ROOT, "brand", "v2");
fs.mkdirSync(OUT, { recursive: true });

const load = (f) => opentype.parse(fs.readFileSync(path.join(FONTS, f)).buffer);
const DISPLAY = load("Archivo-800x112.ttf");
const MONO = load("JetBrainsMono-500.ttf");

const natural = (t, f, s) => {
  const k = s / f.unitsPerEm;
  let w = 0;
  for (const c of t) w += f.charToGlyph(c).advanceWidth * k;
  return w;
};
const fitSize = (t, f, target, trackEm) =>
  target / (natural(t, f, 1) + trackEm * ([...t].length - 1));
const capHeight = (f, s) => (f.tables.os2.sCapHeight / f.unitsPerEm) * s;

/**
 * Glyphs are outlined at the origin and placed with their own transform.
 * opentype.js 2.0.0 emits a NaN coordinate from `getPath(x, …)` at certain
 * fractional positions and sizes, and one bad control point makes renderers
 * silently drop the rest of the string.
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
  return { glyphs, width: x - track };
}
const runAt = (run, x, y) =>
  run.glyphs
    .map((g) => `    <path transform="translate(${R(x + g.x)} ${R(y)})" d="${g.d}"/>`)
    .join("\n");

const NAME = process.env.LOGO_NAME ?? "CLASSY CAPTURES";
const DESCRIPTOR = process.env.LOGO_DESCRIPTOR ?? "WEDDING PHOTOGRAPHY · BENGALURU";
const WORD_TRACK = 0.015;
const TAG_TRACK = 0.34;

const FOIL = `
  <defs>
    <linearGradient id="ccFoil" x1="0" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="#F3E3CB"/>
      <stop offset="0.45" stop-color="#C9A579"/>
      <stop offset="0.72" stop-color="#8A6A49"/>
      <stop offset="1" stop-color="#E8D2B2"/>
    </linearGradient>
  </defs>`;
const PALETTE = {
  ink: { fg: "#111010", defs: "" },
  paper: { fg: "#E7E4DD", defs: "" },
  foil: { fg: "url(#ccFoil)", defs: FOIL },
};

const svg = (w, h, body, defs, label) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${R(w)} ${R(h)}" width="${R(w)}" height="${R(h)}" role="img" aria-label="${label}">
  <title>${label}</title>${defs}
${body}
</svg>
`;

const markAt = (scale, x, y, small = false) => {
  const paths = small
    ? markSmallPaths(scale, { x: x - MARK_BOX.x * scale, y: y - MARK_BOX.y * scale })
    : markPaths(scale, { x: x - MARK_BOX.x * scale, y: y - MARK_BOX.y * scale });
  return paths.map((d) => `    <path d="${d}"/>`).join("\n");
};

/* ── lockups ───────────────────────────────────────────────────────────── */

function stacked(finish) {
  const p = PALETTE[finish];
  const W = 880;
  const PAD = 56;
  const markH = 206;
  const scale = markH / MARK_BOX.h;
  const markW = MARK_BOX.w * scale;

  const wordSize = fitSize(NAME, DISPLAY, 520, WORD_TRACK);
  const word = outline(NAME, DISPLAY, wordSize, WORD_TRACK);
  const cap = capHeight(DISPLAY, wordSize);
  const wordY = PAD + markH + 76 + cap;

  const tagSize = fitSize(DESCRIPTOR, MONO, 420, TAG_TRACK);
  const tag = outline(DESCRIPTOR, MONO, tagSize, TAG_TRACK);
  const tagY = wordY + 48;

  const H = tagY + PAD;
  const body = `  <g fill="${p.fg}">
${markAt(scale, W / 2 - markW / 2, PAD)}
${runAt(word, W / 2 - word.width / 2, wordY)}
${runAt(tag, W / 2 - tag.width / 2, tagY)}
  </g>`;
  return svg(W, H, body, p.defs, `${NAME} — ${DESCRIPTOR}`);
}

function horizontal(finish) {
  const p = PALETTE[finish];
  const PAD = 48;
  const markH = 150;
  const scale = markH / MARK_BOX.h;
  const markW = MARK_BOX.w * scale;

  const wordSize = fitSize(NAME, DISPLAY, 470, WORD_TRACK);
  const word = outline(NAME, DISPLAY, wordSize, WORD_TRACK);
  const cap = capHeight(DISPLAY, wordSize);
  const tagSize = fitSize(DESCRIPTOR, MONO, 395, TAG_TRACK);
  const tag = outline(DESCRIPTOR, MONO, tagSize, TAG_TRACK);

  const textX = PAD + markW + 44;
  const block = cap + 26 + tagSize * 0.72;
  const midY = PAD + markH / 2;
  const wordY = midY - block / 2 + cap;
  const tagY = wordY + 26 + tagSize * 0.72;

  const W = textX + Math.max(word.width, tag.width) + PAD;
  const H = PAD * 2 + markH;
  const body = `  <g fill="${p.fg}">
${markAt(scale, PAD, PAD)}
${runAt(word, textX, wordY)}
${runAt(tag, textX, tagY)}
  </g>`;
  return svg(W, H, body, p.defs, `${NAME} — ${DESCRIPTOR}`);
}

function monogram(finish, small = false) {
  const p = PALETTE[finish];
  const PAD = 16;
  const size = 220;
  const scale = size / MARK_BOX.h;
  const W = MARK_BOX.w * scale + PAD * 2;
  const H = size + PAD * 2;
  const body = `  <g fill="${p.fg}">
${markAt(scale, PAD, PAD, small)}
  </g>`;
  return svg(W, H, body, p.defs, NAME);
}

function wordmark(finish) {
  const p = PALETTE[finish];
  const PAD = 32;
  const size = fitSize(NAME, DISPLAY, 680, WORD_TRACK);
  const word = outline(NAME, DISPLAY, size, WORD_TRACK);
  const cap = capHeight(DISPLAY, size);
  const body = `  <g fill="${p.fg}">
${runAt(word, PAD, PAD + cap)}
  </g>`;
  return svg(word.width + PAD * 2, cap + PAD * 2, body, p.defs, NAME);
}

/* ── write ─────────────────────────────────────────────────────────────── */

const files = {};
for (const finish of ["ink", "paper", "foil"]) {
  files[`cc-stacked-${finish}.svg`] = stacked(finish);
  files[`cc-horizontal-${finish}.svg`] = horizontal(finish);
  files[`cc-monogram-${finish}.svg`] = monogram(finish);
  files[`cc-monogram-small-${finish}.svg`] = monogram(finish, true);
  files[`cc-wordmark-${finish}.svg`] = wordmark(finish);
}

for (const [name, data] of Object.entries(files)) {
  if (/NaN|undefined|Infinity/.test(data)) {
    throw new Error(`${name}: generated SVG contains a non-finite coordinate`);
  }
  fs.writeFileSync(path.join(OUT, name), data);
}
console.log(`${Object.keys(files).length} files -> brand/v2`);
console.log(`name "${NAME}"  ·  descriptor "${DESCRIPTOR}"`);
