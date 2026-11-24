// Rasterises the premium identity to transparent PNGs, builds favicons, and
// copies the SVGs into web/public/brand.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(process.cwd(), "..");
const SRC = path.join(ROOT, "brand", "premium");
const PNG = path.join(SRC, "png");
const PUBLIC = path.join(process.cwd(), "public", "brand");
fs.mkdirSync(PNG, { recursive: true });
fs.mkdirSync(PUBLIC, { recursive: true });

const WIDTHS = {
  stacked: [600, 1200, 2400],
  horizontal: [800, 1600, 3200],
  wordmark: [600, 1200, 2400],
  monogram: [128, 256, 512, 1024],
};

const svgs = fs.readdirSync(SRC).filter((f) => f.endsWith(".svg") && !f.startsWith("_"));

for (const file of svgs) {
  const kind = file.includes("monogram")
    ? "monogram"
    : file.includes("wordmark")
      ? "wordmark"
      : file.includes("horizontal")
        ? "horizontal"
        : "stacked";
  const svg = fs.readFileSync(path.join(SRC, file));
  for (const w of WIDTHS[kind]) {
    await sharp(svg, { density: Math.max(96, Math.ceil((w / 400) * 96)) })
      .resize(w)
      .png({ compressionLevel: 9 })
      .toFile(path.join(PNG, `${file.replace(/\.svg$/, "")}-${w}.png`));
  }
  fs.copyFileSync(path.join(SRC, file), path.join(PUBLIC, file));
}

// Favicons: the reduced monogram, centred on ink with breathing room.
const small = fs.readFileSync(path.join(SRC, "cc-monogram-small-paper.svg"));
for (const size of [32, 64, 180, 512]) {
  const inner = Math.round(size * 0.68);
  const art = await sharp(small, { density: 900 }).resize(inner).png().toBuffer();
  const meta = await sharp(art).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#111010" } })
    .composite([
      { input: art, left: Math.round((size - inner) / 2), top: Math.round((size - meta.height) / 2) },
    ])
    .png()
    .toFile(path.join(PNG, `favicon-${size}.png`));
}

const files = fs.readdirSync(PNG);
console.log(`${svgs.length} SVGs -> web/public/brand`);
console.log(`${files.length} PNGs -> brand/premium/png`);
