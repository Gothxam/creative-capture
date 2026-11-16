// Builds labelled contact sheets of every scraped original image, so the set can be curated.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve(process.cwd(), "..", "assets", "uploads");
const OUT = path.resolve(process.cwd(), "..", "scrape", "contact");
fs.mkdirSync(OUT, { recursive: true });

const VARIANT = /-\d{2,4}x\d{2,4}\.(jpe?g|png|webp)$/i;
const IMG = /\.(jpe?g|png|webp)$/i;

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (IMG.test(e.name) && !VARIANT.test(e.name)) out.push(p);
  }
  return out;
}

const files = walk(SRC).sort();
fs.writeFileSync(
  path.join(OUT, "index.json"),
  JSON.stringify(files.map((f, i) => ({ i, file: path.relative(SRC, f).replace(/\\/g, "/") })), null, 2),
);

const COLS = 6;
const ROWS = 5;
const CELL = 300;
const LABEL = 26;
const PER = COLS * ROWS;

console.log(`${files.length} originals -> ${Math.ceil(files.length / PER)} sheets`);

for (let s = 0; s * PER < files.length; s++) {
  const batch = files.slice(s * PER, (s + 1) * PER);
  const rows = Math.ceil(batch.length / COLS);
  const W = COLS * CELL;
  const H = rows * (CELL + LABEL);

  const composites = [];
  for (let n = 0; n < batch.length; n++) {
    const idx = s * PER + n;
    const col = n % COLS;
    const row = Math.floor(n / COLS);
    const x = col * CELL;
    const y = row * (CELL + LABEL);

    const buf = await sharp(batch[n])
      .resize(CELL, CELL, { fit: "cover", position: "attention" })
      .toBuffer();
    composites.push({ input: buf, left: x, top: y + LABEL });

    const name = path.basename(batch[n]).replace(/[<&>]/g, "").slice(0, 34);
    const svg = `<svg width="${CELL}" height="${LABEL}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${CELL}" height="${LABEL}" fill="#111"/>
      <text x="6" y="18" font-family="monospace" font-size="14" fill="#fff">[${idx}] ${name}</text>
    </svg>`;
    composites.push({ input: Buffer.from(svg), left: x, top: y });
  }

  const dest = path.join(OUT, `sheet-${s + 1}.jpg`);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#000" } })
    .composite(composites)
    .jpeg({ quality: 72 })
    .toFile(dest);
  console.log("wrote", dest, `(${batch.length} images)`);
}
