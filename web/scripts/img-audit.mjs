/**
 * Image fitness audit.
 *
 * Catches three failures that the eye misses until the photograph is already
 * on screen at the wrong size.
 *
 *   SIZES — the `sizes` attribute disagrees with the box the image actually
 *   paints into. This is the one that bites, because `sizes` is how the
 *   browser budgets: declare 30vw for a box that turns out to be 946px and it
 *   will pick the 800px file for a 432px slot and then stretch it. The number
 *   is readable at runtime through a quirk of the spec — on an image with
 *   width descriptors, `naturalWidth` reports the density-corrected intrinsic
 *   size, which works out to exactly the width `sizes` resolved to.
 *
 *   UPSCALE — the chosen file is smaller than the box in device pixels, so it
 *   is being enlarged. Checked at 1x and again at 2x, because a phone asks
 *   for twice the pixels and a file that holds up on this monitor can be mush
 *   there.
 *
 *   CROP — the box's proportions are far from the photograph's own, so
 *   object-cover is discarding a large share of the frame. A 0.52 portrait in
 *   a 21/9 band keeps about a fifth of the picture.
 *
 *   node scripts/img-audit.mjs [desktop|mobile]
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";
const DEVICE = process.argv[2] ?? "desktop";
const VIEWPORT =
  DEVICE === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 900 };

const ROUTES = [
  "/", "/about", "/services", "/weddings",
  "/pre-wedding", "/portraits", "/films", "/gallery", "/contact",
];

/** How far `sizes` may miss the real box before it is worth reporting. */
const SIZES_SLACK = 1.25;
/** How much of the source may be discarded before it is worth reporting. */
const CROP_LIMIT = 0.42;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
const findings = [];

for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(7000);
  // Walk the page so lazy images below the fold load and take their size.
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 300));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const imgs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("img"))
      .map((img) => {
        const r = img.getBoundingClientRect();
        if (r.width < 24 || r.height < 24 || !img.complete) return null;
        return {
          src: img.currentSrc || img.src,
          sizesAttr: img.getAttribute("sizes") || "",
          hasSrcSet: !!img.getAttribute("srcset"),
          // A full-bleed texture under type is meant to be cropped hard;
          // reporting it drowns out the frames where a crop is a mistake.
          backdrop: img.hasAttribute("data-backdrop"),
          // The largest candidate the browser could reach for. Judging
          // sharpness by the file it picked at this device ratio says nothing
          // about a retina screen, which would reach for a bigger one.
          maxCandidate: Math.max(
            0,
            ...(img.getAttribute("srcset") || "")
              .split(",")
              .map((c) => Number((c.trim().match(/\s(\d+)w$/) || [])[1] || 0)),
          ),
          boxW: Math.round(r.width),
          boxH: Math.round(r.height),
          // On a w-descriptor srcset this is the width `sizes` resolved to.
          budget: img.naturalWidth,
          budgetH: img.naturalHeight,
        };
      })
      .filter(Boolean),
  );

  const seen = new Set();
  for (const i of imgs) {
    const file = i.src.split("/").pop() ?? "";
    const m = file.match(/-(\d+)\.webp$/);
    if (!m) continue; // posters and other one-off assets
    const fileW = Number(m[1]);

    const key = `${file}@${i.boxW}x${i.boxH}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // The true source proportions, recovered from the budgeted pair.
    const srcAR = i.budget && i.budgetH ? i.budget / i.budgetH : null;
    const boxAR = i.boxW / i.boxH;
    const kept = srcAR ? (srcAR > boxAR ? boxAR / srcAR : srcAR / boxAR) : 1;
    const cropped = 1 - kept;

    const flags = [];
    if (i.hasSrcSet && i.budget && i.boxW / i.budget > SIZES_SLACK) {
      flags.push(`SIZES says ${i.budget}px for a ${i.boxW}px box ("${i.sizesAttr}")`);
    }
    // Against the largest file that exists, not the one this run happened to
    // fetch: at deviceScaleFactor 1 the browser correctly picks a small
    // candidate, and calling that "soft on retina" would flag the whole site.
    const best = Math.max(i.maxCandidate, fileW);
    if (best < i.boxW) flags.push(`UPSCALED x${(i.boxW / best).toFixed(2)} at 1x`);
    else if (best < i.boxW * 2) flags.push(`soft at 2x (${(best / i.boxW).toFixed(2)}x)`);
    if (!i.backdrop && cropped > CROP_LIMIT) flags.push(`CROPS ${(cropped * 100).toFixed(0)}%`);

    if (flags.length) {
      findings.push({ route, file, fileW, ...i, cropped, flags });
    }
  }
}
await browser.close();

const bad = (f) => f.flags.some((x) => !x.startsWith("soft at 2x"));
const severe = findings.filter(bad);
const soft = findings.filter((f) => !bad(f));

const line = (f) =>
  `  ${f.route.padEnd(13)} ${f.file.padEnd(30)} box ${String(f.boxW).padStart(4)}x${String(f.boxH).padEnd(4)}` +
  `  ${f.flags.join(" · ")}`;

console.log(`\n=== ${DEVICE} ${VIEWPORT.width}x${VIEWPORT.height} ===`);
console.log(`\nSEVERE: ${severe.length}`);
severe.forEach((f) => console.log(line(f)));
console.log(`\nSOFT ON RETINA ONLY: ${soft.length}`);
soft.forEach((f) => console.log(line(f)));
console.log("");

process.exit(severe.length ? 1 : 0);
