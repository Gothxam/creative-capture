/**
 * How much of each page is photography, and how much is type.
 *
 * "Photo-focused" is easy to argue about and hard to settle by eye, so this
 * measures it. For every route it walks the whole document and adds up the
 * painted area of images and video against the painted area of text blocks,
 * then reports photography as a share of the two.
 *
 * Text area is measured on the leaf elements that actually hold words, not on
 * their containers, so a section wrapper around a photograph is not counted
 * as type. Display type is tracked separately, because a page can be mostly
 * photographs by area and still read as a type site when what type there is
 * arrives at 60px.
 *
 *   node scripts/balance.mjs [desktop|mobile]
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });

const rows = [];
for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(6500);
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 300));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);

  const m = await page.evaluate(() => {
    const docH = document.body.scrollHeight;
    const vw = document.documentElement.clientWidth;

    let media = 0;
    let mediaCount = 0;
    document.querySelectorAll("img, video").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) return;
      // Clamp to the page: a horizontal strip runs far wider than the screen.
      const w = Math.min(r.width, vw * 1.6);
      media += w * r.height;
      mediaCount += 1;
    });

    let text = 0;
    let display = 0;
    const WORDS = /\S/;
    document.querySelectorAll("h1,h2,h3,h4,p,span,li,a,div,figcaption").forEach((el) => {
      // Leaves only — an element whose children also hold text would double count.
      const ownText = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join("");
      if (!WORDS.test(ownText)) return;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) return;
      const size = parseFloat(getComputedStyle(el).fontSize) || 0;
      const w = Math.min(r.width, vw * 1.6);
      const area = w * r.height;
      text += area;
      if (size >= 34) display += area;
    });

    return { docH, media, mediaCount, text, display };
  });

  const total = m.media + m.text;
  rows.push({
    route,
    photoPct: total ? (m.media / total) * 100 : 0,
    displayPct: m.text ? (m.display / m.text) * 100 : 0,
    perScreen: m.docH ? m.mediaCount / (m.docH / VIEWPORT.height) : 0,
    screens: m.docH / VIEWPORT.height,
  });
}
await browser.close();

console.log(`\n=== ${DEVICE} ${VIEWPORT.width}x${VIEWPORT.height} ===`);
console.log("route          photo%  of type, display%  photos/screen  screens");
for (const r of rows) {
  const bar = "#".repeat(Math.round(r.photoPct / 4)).padEnd(25, ".");
  console.log(
    `${r.route.padEnd(14)} ${r.photoPct.toFixed(0).padStart(4)}%  ${bar} ` +
      `${r.displayPct.toFixed(0).padStart(4)}%  ${r.perScreen.toFixed(1).padStart(8)}  ` +
      `${r.screens.toFixed(1).padStart(6)}`,
  );
}
const avg = rows.reduce((a, r) => a + r.photoPct, 0) / rows.length;
console.log(`\nmean photo share: ${avg.toFixed(1)}%\n`);
