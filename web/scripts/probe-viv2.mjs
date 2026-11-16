// The reference disables native scrolling and drives the gallery from raw
// wheel input, so this probe dispatches real wheel events and watches the
// wrapper and per-item transforms respond.
import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://vivmgmt.com/", { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(4000);

const read = () =>
  page.evaluate(() => {
    const tf = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return { x: +m.m41.toFixed(1), y: +m.m42.toFixed(1) };
    };
    const items = [...document.querySelectorAll(".c-home__gallery-media-wrap")].map((el) => {
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.left), ty: +m.m42.toFixed(1), tx: +m.m41.toFixed(1) };
    });
    return { inner: tf(".c-home__parallax-inner"), outer: tf(".c-home__parallax"), items };
  });

await page.mouse.move(720, 450);

const before = await read();
console.log("BEFORE  inner:", JSON.stringify(before.inner), " items:", before.items.length);

// Three wheel bursts of 600px each.
for (let n = 0; n < 3; n++) {
  for (let k = 0; k < 12; k++) {
    await page.mouse.wheel(0, 50);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(900);
  const s = await read();
  console.log(
    `after ${(n + 1) * 600}px wheel  inner:`,
    JSON.stringify(s.inner),
    " outer:",
    JSON.stringify(s.outer),
  );
}

const after = await read();

console.log("\nper-item vertical drift (grouped by column x):");
const byCol = new Map();
after.items.forEach((it, i) => {
  const key = Math.round(it.x / 40) * 40;
  if (!byCol.has(key)) byCol.set(key, []);
  byCol.get(key).push({ i, ty: it.ty, dty: +(it.ty - (before.items[i]?.ty ?? 0)).toFixed(1) });
});
[...byCol.entries()]
  .sort((a, b) => a[0] - b[0])
  .forEach(([x, list]) => {
    console.log(`  x≈${String(x).padStart(5)}  ` + list.map((l) => `#${l.i}:Δ${l.dty}`).join("  "));
  });

const dx = (after.inner?.x ?? 0) - (before.inner?.x ?? 0);
console.log(`\ninner wrapper moved ${dx}px horizontally for 1800px of wheel input`);
console.log(`ratio: ${(dx / -1800).toFixed(3)} px of X per px of wheel`);

await browser.close();
