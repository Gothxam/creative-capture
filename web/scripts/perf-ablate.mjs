// Ablation: re-runs the scroll probe with one suspected cost disabled at a
// time, so the jank can be attributed instead of guessed at.
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";

const ROUTE = process.argv[2] ?? "/";

const VARIANTS = {
  baseline: "",
  "no-col-willchange": `[data-col]{will-change:auto!important}`,
  "no-wall-willchange": `[data-col],[data-col]:first-child{will-change:auto!important}`,
  "no-col-transform": `[data-col]{transform:none!important}`,
  "no-blur-bg": `figure > div{background-image:none!important}`,
  "no-captions": `figcaption{display:none!important}`,
};

const browser = await chromium.launch();

async function run(name, css) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  if (css) await page.addInitScript((c) => {
    window.addEventListener("DOMContentLoaded", () => {
      const s = document.createElement("style");
      s.textContent = c;
      document.head.appendChild(s);
    });
  }, css);

  await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.evaluate(() => {
    window.__f = [];
    let last = performance.now();
    const tick = (t) => { window.__f.push(t - last); last = t; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });

  await page.evaluate(async () => {
    const h = document.body.scrollHeight - window.innerHeight;
    let y = 0;
    while (y < h) { y += 55; window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(r)); }
  });
  await page.waitForTimeout(400);

  const r = await page.evaluate(() => {
    const f = window.__f.filter((d) => d > 0 && d < 2000).slice(5).sort((a, b) => a - b);
    const long = f.filter((d) => d > 32).length;
    return {
      p50: +f[Math.floor(f.length * 0.5)].toFixed(1),
      p90: +f[Math.floor(f.length * 0.9)].toFixed(1),
      longPct: +((long / f.length) * 100).toFixed(1),
    };
  });
  await page.close();
  console.log(`${name.padEnd(22)} p50 ${String(r.p50).padStart(5)}ms  p90 ${String(r.p90).padStart(5)}ms  long ${String(r.longPct).padStart(5)}%`);
}

for (const [name, css] of Object.entries(VARIANTS)) await run(name, css);
await browser.close();
