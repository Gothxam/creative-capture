// Classy Captures — identity, v3 (camera).
//
// Mark: logo-mark-camera.mjs. Type: Archivo for the name, JetBrains Mono for
// the descriptor — the site's own faces. Outlined to paths, so no font is
// needed to open or place the files. Transparent throughout.
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";
import { cameraPath, cameraSmallPath, cameraOutline, CAMERA_BOX } from "./logo-mark-camera.mjs";
import { R } from "./logo-mark.mjs";

const ROOT = path.resolve(process.cwd(), "..");
const FONTS = path.join(ROOT, "brand", "fonts");
const OUT = path.join(ROOT, "brand", "v3");
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

/** Glyphs are outlined at the origin — see the note at the foot of this file. */
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

/** Places the camera at a given height with its top-left at (x, y). */
function markAt(height, x, y, form = "full") {
  const scale = height / CAMERA_BOX.h;
  const tx = R(x - CAMERA_BOX.x * scale);
  const ty = R(y - CAMERA_BOX.y * scale);
  const t = `translate(${tx} ${ty}) scale(${R(scale)})`;
  if (form === "outline") {
    const o = cameraOutline();
    return `    <g transform="${t}">
      <path fill="none" stroke="currentColor" stroke-width="${o.strokeWidth}" stroke-linejoin="round" d="${o.stroke}"/>
      <path d="${o.fill}"/>
    </g>`;
  }
  const d = form === "small" ? cameraSmallPath() : cameraPath();
  return `    <path transform="${t}" fill-rule="evenodd" d="${d}"/>`;
}
const markWidth = (height) => (CAMERA_BOX.w * height) / CAMERA_BOX.h;

/* ── lockups ───────────────────────────────────────────────────────────── */

function stacked(finish, form = "full") {
  const p = PALETTE[finish];
  const W = 880;
  const PAD = 54;
  const markH = 190;
  const mw = markWidth(markH);

  const wordSize = fitSize(NAME, DISPLAY, 520, WORD_TRACK);
  const word = outline(NAME, DISPLAY, wordSize, WORD_TRACK);
  const cap = capHeight(DISPLAY, wordSize);
  const wordY = PAD + markH + 72 + cap;

  const tagSize = fitSize(DESCRIPTOR, MONO, 420, TAG_TRACK);
  const tag = outline(DESCRIPTOR, MONO, tagSize, TAG_TRACK);
  const tagY = wordY + 48;

  const body = `  <g fill="${p.fg}" color="${p.fg}">
${markAt(markH, W / 2 - mw / 2, PAD, form)}
${runAt(word, W / 2 - word.width / 2, wordY)}
${runAt(tag, W / 2 - tag.width / 2, tagY)}
  </g>`;
  return svg(W, tagY + PAD, body, p.defs, `${NAME} — ${DESCRIPTOR}`);
}

function horizontal(finish, form = "full") {
  const p = PALETTE[finish];
  const PAD = 46;
  const markH = 134;
  const mw = markWidth(markH);

  const wordSize = fitSize(NAME, DISPLAY, 460, WORD_TRACK);
  const word = outline(NAME, DISPLAY, wordSize, WORD_TRACK);
  const cap = capHeight(DISPLAY, wordSize);
  const tagSize = fitSize(DESCRIPTOR, MONO, 388, TAG_TRACK);
  const tag = outline(DESCRIPTOR, MONO, tagSize, TAG_TRACK);

  const textX = PAD + mw + 40;
  const block = cap + 24 + tagSize * 0.72;
  const midY = PAD + markH / 2;
  const wordY = midY - block / 2 + cap;
  const tagY = wordY + 24 + tagSize * 0.72;

  const body = `  <g fill="${p.fg}" color="${p.fg}">
${markAt(markH, PAD, PAD, form)}
${runAt(word, textX, wordY)}
${runAt(tag, textX, tagY)}
  </g>`;
  return svg(textX + Math.max(word.width, tag.width) + PAD, PAD * 2 + markH, body, p.defs, `${NAME} — ${DESCRIPTOR}`);
}

function markOnly(finish, form = "full") {
  const p = PALETTE[finish];
  const PAD = 16;
  const h = 200;
  const body = `  <g fill="${p.fg}" color="${p.fg}">
${markAt(h, PAD, PAD, form)}
  </g>`;
  return svg(markWidth(h) + PAD * 2, h + PAD * 2, body, p.defs, NAME);
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
  files[`cc-mark-${finish}.svg`] = markOnly(finish);
  files[`cc-mark-small-${finish}.svg`] = markOnly(finish, "small");
  files[`cc-mark-outline-${finish}.svg`] = markOnly(finish, "outline");
  files[`cc-wordmark-${finish}.svg`] = wordmark(finish);
}
files["cc-stacked-outline-ink.svg"] = stacked("ink", "outline");

for (const [name, data] of Object.entries(files)) {
  // A single NaN coordinate makes renderers drop the rest of a path silently.
  if (/NaN|undefined|Infinity/.test(data)) {
    throw new Error(`${name}: generated SVG contains a non-finite coordinate`);
  }
  fs.writeFileSync(path.join(OUT, name), data);
}
console.log(`${Object.keys(files).length} files -> brand/v3`);
console.log(`name "${NAME}"  ·  descriptor "${DESCRIPTOR}"`);
