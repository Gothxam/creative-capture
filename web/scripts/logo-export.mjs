// Rasterises the logo SVGs to transparent PNGs at a few useful widths, and
// copies the site-facing variants into web/public/brand.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "..");
const BRAND = path.join(ROOT, "brand");
const PNG = path.join(BRAND, "png");
const PUBLIC = path.join(process.cwd(), "public", "brand");
fs.mkdirSync(PNG, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

const LOCKUP_WIDTHS = [600, 1200, 2400];
const MARK_WIDTHS = [256, 512, 1024];

const jobs = [
  ["classy-capture-logo.svg", LOCKUP_WIDTHS],
  ["classy-capture-logo-ink.svg", LOCKUP_WIDTHS],
  ["classy-capture-logo-paper.svg", LOCKUP_WIDTHS],
  ["classy-capture-mark.svg", MARK_WIDTHS],
  ["classy-capture-mark-ink.svg", MARK_WIDTHS],
  ["classy-capture-mark-paper.svg", MARK_WIDTHS],
];

for (const [file, widths] of jobs) {
  const svg = fs.readFileSync(path.join(BRAND, file));
  for (const w of widths) {
    const out = path.join(PNG, `${file.replace(/\.svg$/, "")}-${w}.png`);
    await sharp(svg, { density: Math.ceil((w / 1000) * 300) })
      .resize(w)
      .png({ compressionLevel: 9 })
      .toFile(out);
  }
  fs.copyFileSync(path.join(BRAND, file), path.join(PUBLIC, file));
}

// A square, padded favicon from the mark.
const markSvg = fs.readFileSync(path.join(BRAND, "classy-capture-mark-paper.svg"));
for (const size of [64, 180, 512]) {
  const inner = Math.round(size * 0.82);
  const art = await sharp(markSvg, { density: 600 }).resize(inner).png().toBuffer();
  const meta = await sharp(art).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#111010" } })
    .composite([{ input: art, left: Math.round((size - inner) / 2), top: Math.round((size - meta.height) / 2) }])
    .png()
    .toFile(path.join(PNG, `favicon-${size}.png`));
}

const list = fs.readdirSync(PNG).sort();
console.log(`${list.length} PNGs -> brand/png`);
for (const f of list) {
  const { size } = fs.statSync(path.join(PNG, f));
  console.log(`  ${f.padEnd(44)} ${String(Math.round(size / 1024)).padStart(5)} KB`);
}
console.log(`\nSVGs copied to web/public/brand`);
