/**
 * Cut the supplied logo PNGs down to usable assets.
 *
 * The files arrive 2000x2000 on a flat #f4f4f4 ground with no alpha, which
 * happens to be exactly this site's paper colour. That is fine on a paper
 * page and useless everywhere else: dropped on the black hero the mark
 * would sit in a light square.
 *
 * So the ground is turned into real transparency, and a second copy is made
 * with the black recoloured for dark grounds. The accent dot is detected by
 * hue and left alone in both.
 *
 * Alpha comes from how far each pixel has travelled from the ground toward
 * ink, which keeps the antialiased edges clean — a plain colour-key would
 * leave a light fringe around every petal at the sizes this is used at.
 *
 *   node scripts/logo-extract.mjs <folder-with-1.png-2.png-3.png>
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = process.argv[2];
if (!SRC) {
  console.error("usage: node scripts/logo-extract.mjs <folder>");
  process.exit(1);
}

const OUT = "public/brand/marks";
const GROUND = 244; // #f4f4f4
const PAPER = [244, 244, 244];
const INK = [4, 4, 4];

/** Is this pixel part of the accent dot rather than the black? */
const isAccent = (r, g, b) => r - Math.max(g, b) > 28;

/**
 * @param {string} file   source png
 * @param {number[]} body colour to paint the non-accent marks in
 */
async function cut(file, body) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0, o = 0; i < data.length; i += channels, o += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let cr;
    let cg;
    let cb;
    let a;

    if (isAccent(r, g, b)) {
      cr = r;
      cg = g;
      cb = b;
      a = 255;
    } else {
      // How dark is it, relative to the ground? That is the coverage.
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      a = Math.round(Math.max(0, Math.min(1, (GROUND - lum) / GROUND)) * 255);
      [cr, cg, cb] = body;
    }

    out[o] = cr;
    out[o + 1] = cg;
    out[o + 2] = cb;
    out[o + 3] = a;

    if (a > 8) {
      const px = (i / channels) % width;
      const py = Math.floor(i / channels / width);
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
  }

  // Trim to what is actually drawn, then centre it on a square canvas so
  // every size this is rendered at stays centred and the aspect never
  // shifts.
  //
  // The squaring is a composite onto a canvas, not `.extend()` on the same
  // pipeline. Sharp runs its operations in a fixed order — extract, resize,
  // extend — not the order they are written, so an extend written before a
  // resize is applied after it, at the wrong scale. Doing that produced a
  // 556x386 asset from a request for a 256x256 one.
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const side = Math.round(Math.max(w, h) * 1.08);

  const art = await sharp(out, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: w, height: h })
    .png()
    .toBuffer();

  return sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: art, left: Math.round((side - w) / 2), top: Math.round((side - h) / 2) }])
    .png()
    .toBuffer();
}

/** Square canvas in, finished asset out. */
const emit = (buf, px, file) =>
  sharp(buf).resize(px, px, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(file);

fs.mkdirSync(OUT, { recursive: true });

const MARK = path.join(SRC, "2.png"); // the mark on its own
const LOCKUP = path.join(SRC, "1.png"); // mark over the wordmark

// 256px covers the largest place it is used (the footer, at 56px CSS) on a
// 3x screen with room to spare, and costs a few kilobytes.
await emit(await cut(MARK, INK), 256, `${OUT}/cc-mark-ink.png`);
await emit(await cut(MARK, PAPER), 256, `${OUT}/cc-mark-paper.png`);

// The favicon wants a ground of its own — a transparent mark disappears
// against a dark browser chrome.
await sharp(await cut(MARK, INK))
  .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .flatten({ background: "#f4f4f4" })
  .png({ compressionLevel: 9 })
  .toFile("public/icon.png");

// The full lockup, for sharing cards and anywhere the mark needs its name.
await emit(await cut(LOCKUP, INK), 640, `${OUT}/cc-lockup-ink.png`);
await emit(await cut(LOCKUP, PAPER), 640, `${OUT}/cc-lockup-paper.png`);

for (const f of ["cc-mark-ink.png", "cc-mark-paper.png", "cc-lockup-ink.png", "cc-lockup-paper.png"]) {
  console.log(f, (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(1) + "kb");
}
console.log("icon.png", (fs.statSync("public/icon.png").size / 1024).toFixed(1) + "kb");
