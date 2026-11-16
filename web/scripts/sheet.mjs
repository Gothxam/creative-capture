import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.resolve(process.cwd(), "..", "scrape", "shots");
const prefix = process.argv[2] ?? "desktop-home";
const out = process.argv[3] ?? `_${prefix}.jpg`;
const COLS = Number(process.argv[4] ?? 3);
const W = Number(process.argv[5] ?? 500);

const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith(".png")).sort();
if (!files.length) { console.log("no files for", prefix); process.exit(0); }

const first = await sharp(path.join(dir, files[0])).metadata();
const CH = Math.round((W * first.height) / first.width);
const LAB = 20;
const rows = Math.ceil(files.length / COLS);
const comp = [];

for (let i = 0; i < files.length; i++) {
  const buf = await sharp(path.join(dir, files[i])).resize(W).toBuffer();
  const x = (i % COLS) * W;
  const y = Math.floor(i / COLS) * (CH + LAB);
  comp.push({ input: buf, left: x, top: y + LAB });
  const svg = `<svg width="${W}" height="${LAB}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${LAB}" fill="#111"/><text x="5" y="15" font-family="monospace" font-size="12" fill="#0f0">${files[i]}</text></svg>`;
  comp.push({ input: Buffer.from(svg), left: x, top: y });
}

await sharp({ create: { width: COLS * W, height: rows * (CH + LAB), channels: 3, background: "#222" } })
  .composite(comp)
  .jpeg({ quality: 84 })
  .toFile(path.join(dir, out));
console.log("wrote", out, `${files.length} shots`);
