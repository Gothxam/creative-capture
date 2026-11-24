// Curated selection from the scraped library -> optimised WebP + blur placeholders.
// Collage/grid composites, starter-template stock avatars and logo files are excluded here
// and handled separately.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve(process.cwd(), "..", "assets", "uploads");
const OUT = path.resolve(process.cwd(), "public", "img");
const MANIFEST = path.resolve(process.cwd(), "lib", "media.generated.ts");

// slug -> source file (relative to assets/uploads), with the category it belongs to.
export const PICKS = [
  // ——— weddings: ceremony, ritual, celebration
  ["mandap-garland", "2025/11/1.png", "weddings"],
  ["temple-vows", "2025/11/2.png", "weddings"],
  ["blessing-rice", "2025/11/6.png", "weddings"],
  ["kalash-hands", "2025/11/8.png", "weddings"],
  ["garland-knot", "2025/11/9.png", "weddings"],
  ["bride-jewels", "2025/12/01-1.jpg", "weddings"],
  ["garland-exchange", "2025/11/DSCF8782-1-scaled.jpg", "weddings"],
  ["sindoor-moment", "2025/11/DSC09512-1-scaled.jpg", "weddings"],
  ["haldi-shower", "2025/11/DSC09766-1-scaled.jpg", "weddings"],
  ["sehra-tying", "2025/11/DSC09784a-scaled.jpg", "weddings"],
  ["ritual-hands", "2025/11/DSC00047-scaled.jpg", "weddings"],
  ["mandap-wide", "2025/11/DSC00058-scaled.jpg", "weddings"],
  ["couple-seated", "2025/11/DSC08826-scaled.jpg", "weddings"],
  ["doorway-couple", "2025/12/13-1.jpg", "weddings"],
  ["temple-groom", "2025/12/4.jpg", "weddings"],
  ["henna-ring", "2025/12/DSCF6036-scaled.jpg", "weddings"],
  ["red-veil", "2025/12/10-1.jpg", "weddings"],
  ["window-silhouette", "2025/12/11-1.jpg", "weddings"],
  ["stairwell-bw", "2025/12/07.jpg", "weddings"],

  // ——— pre-wedding
  ["meadow-hat", "2025/11/1-1.png", "pre-wedding"],
  ["grass-rest", "2025/11/2-1.png", "pre-wedding"],
  ["rain-embrace", "2025/11/3-1.png", "pre-wedding"],
  ["umbrella-rain", "2025/11/4-1.png", "pre-wedding"],
  ["garden-embrace", "2025/11/4.png", "pre-wedding"],
  ["banyan-kiss", "2025/11/DSCF4436-1-scaled.jpg", "pre-wedding"],
  ["riverbed", "2025/11/DSCF6498a-scaled.jpg", "pre-wedding"],
  ["bullock-cart", "2025/12/15-1.jpg", "pre-wedding"],
  ["teal-stairs", "2025/12/18.jpg", "pre-wedding"],
  ["backwater-walk", "2025/12/DSCF6412-2-scaled.jpg", "pre-wedding"],
  ["creek-embrace", "2025/12/DSCF6498-scaled.jpg", "pre-wedding"],
  ["rocks-seated", "2025/12/DSCF6541-scaled.jpg", "pre-wedding"],
  ["forehead-rest", "2025/12/DSCF6307-1-scaled.jpg", "pre-wedding"],
  ["red-saree-hold", "2025/12/DSCF6054-2-scaled.jpg", "pre-wedding"],
  ["close-whisper", "2025/12/DSCF6220-scaled.jpg", "pre-wedding"],

  // ——— portraits
  ["mehndi-frame", "2025/11/Laughter-echoed-haldi-flew-and-mom.jpg", "portraits"],
  ["petals-seated", "2025/11/The-sky-adorned-the-earth-divine-L.jpg", "portraits"],
  ["petals-twirl", "2025/11/The-sky-adorned-the-earth-divine-L-1.jpg", "portraits"],
  ["bride-red-gold", "2025/12/01-3.jpg", "portraits"],
  ["bride-chamundeshwari", "2025/11/🌿-The-celebrations-restbut-the-grace", "portraits"],
  // "veil-blur" was dropped here. It is not a photograph but a finished
  // album page, with the client's name — INCHARA — set across the top of it.
  // Running it in the portfolio puts one couple's branding on the studio's
  // own pages, and it led /portraits at full width. Cropping the title out
  // takes the negative space the picture is built on with it.
  // "portrait-bw" was dropped here. Its source is only 420px wide — the
  // smallest file in the library by a wide margin — and every editorial slot
  // on the site paints wider than that, so wherever it landed it was being
  // enlarged. There is no version of it worth shipping.
  ["soft-smile", "2025/11/get.jpg", "portraits"],
  // "close-eyes" was dropped here. It is a social template rather than a
  // frame: the photograph is pasted over a blurred greyscale copy of itself
  // and the join shows as a hard rectangle, which reads as a broken image
  // once it is given an editorial slot.
];

const SIZES = [2200, 1400, 800, 420];

function resolveSource(rel) {
  const direct = path.join(SRC, rel);
  if (fs.existsSync(direct)) return direct;
  // tolerate the long emoji/em-dash filenames by matching on a prefix
  const dir = path.join(SRC, path.dirname(rel));
  if (!fs.existsSync(dir)) return null;
  const base = path.basename(rel).replace(/\.[a-z]+$/i, "");
  const hit = fs
    .readdirSync(dir)
    .find((f) => f.startsWith(base.slice(0, Math.min(base.length, 28))));
  return hit ? path.join(dir, hit) : null;
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

const entries = [];
const missing = [];

for (const [slug, rel, category] of PICKS) {
  const src = resolveSource(rel);
  if (!src) {
    missing.push(rel);
    continue;
  }
  const meta = await sharp(src).metadata();
  const ratio = meta.width / meta.height;

  for (const w of SIZES) {
    if (w > meta.width * 1.1) continue;
    const dest = path.join(OUT, `${slug}-${w}.webp`);
    if (!fs.existsSync(dest)) {
      await sharp(src)
        .rotate()
        .resize(w, null, { withoutEnlargement: true })
        .webp({ quality: w >= 2000 ? 72 : 78, effort: 5 })
        .toFile(dest);
    }
  }

  const blurBuf = await sharp(src).rotate().resize(18, null).webp({ quality: 40 }).toBuffer();
  const widths = SIZES.filter((w) => fs.existsSync(path.join(OUT, `${slug}-${w}.webp`)));

  entries.push({
    slug,
    category,
    ratio: Number(ratio.toFixed(4)),
    widths,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
    source: path.relative(SRC, src).replace(/\\/g, "/"),
  });
  process.stdout.write(`. ${slug}\n`);
}

const ts = `// AUTO-GENERATED by scripts/curate.mjs — do not edit by hand.
export type MediaCategory = "weddings" | "pre-wedding" | "portraits";

export type MediaItem = {
  slug: string;
  category: MediaCategory;
  ratio: number;
  widths: number[];
  blur: string;
  source: string;
};

export const MEDIA: MediaItem[] = ${JSON.stringify(entries, null, 2)} as const;

export const bySlug = (slug: string): MediaItem => {
  const hit = MEDIA.find((m) => m.slug === slug);
  if (!hit) throw new Error(\`Unknown media slug: \${slug}\`);
  return hit;
};

export const byCategory = (category: MediaCategory): MediaItem[] =>
  MEDIA.filter((m) => m.category === category);
`;

fs.writeFileSync(MANIFEST, ts);
console.log(`\n${entries.length} images optimised -> public/img`);
if (missing.length) console.log("MISSING:", missing);
