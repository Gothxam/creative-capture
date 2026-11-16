// Transcodes the studio's masters into small, muted, loopable web clips + poster frames.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";
import sharp from "sharp";

const SRC = path.resolve(process.cwd(), "..", "assets", "uploads", "2025", "11");
const OUT = path.resolve(process.cwd(), "public", "video");
const POSTER = path.resolve(process.cwd(), "public", "img");
fs.mkdirSync(OUT, { recursive: true });

// name, source file, start (s), duration (s), output width, orientation
// Clips that play large — the home hero and the films showreel — are encoded
// at full width. The remaining grid cards render three-up at roughly 380px,
// so they are cut to 640px: decoding three 1120px streams at once was costing
// frames on scroll for detail invisible at that size.
//
// `film-ceremony` is the home hero, so it is encoded large even though it
// also appears as a grid card.
const CLIPS = [
  ["film-ceremony", "Website-classy-images-2.mp4", 18, 14, 1280, "landscape"],
  ["film-teaser", "Pooja-and-Sourab-Teaser-1.mp4", 14, 16, 1120, "landscape"],
  ["film-celebration", "Website-classy-images-3.mp4", 12, 14, 640, "landscape"],
  ["film-portrait", "Website-classy-images-4.mp4", 20, 14, 640, "landscape"],
  // Kept in the pipeline as an alternative hero source; not referenced today.
  ["hero-loop", "Website-classy-images-1.mp4", 26, 16, 1280, "landscape"],
];

const run = (args) => execFileSync(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });

for (const [name, file, start, dur, width, orient] of CLIPS) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) {
    console.log("skip (missing source):", file);
    continue;
  }
  const mp4 = path.join(OUT, `${name}.mp4`);
  const scale = orient === "portrait" ? `scale=${width}:-2` : `scale=${width}:-2`;

  if (!fs.existsSync(mp4)) {
    run([
      "-y",
      "-ss", String(start),
      "-i", src,
      "-t", String(dur),
      "-an",
      "-vf", `${scale},fps=25`,
      "-c:v", "libx264",
      "-profile:v", "high",
      "-preset", "slow",
      "-crf", "30",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      mp4,
    ]);
  }

  const frameTmp = path.join(OUT, `${name}.poster.png`);
  run(["-y", "-ss", String(start + Math.min(2, dur / 3)), "-i", src, "-frames:v", "1", frameTmp]);
  await sharp(frameTmp).resize(width).webp({ quality: 72 }).toFile(path.join(POSTER, `${name}-poster.webp`));
  fs.unlinkSync(frameTmp);

  const kb = Math.round(fs.statSync(mp4).size / 1024);
  console.log(`${name.padEnd(18)} ${String(kb).padStart(6)} KB  (${dur}s @ ${width}px)`);
}

const total = fs
  .readdirSync(OUT)
  .filter((f) => f.endsWith(".mp4"))
  .reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`\ntotal video: ${(total / 1048576).toFixed(1)} MB`);
