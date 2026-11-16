// Scroll-performance probe: drives a real scroll at a steady rate and records
// frame-to-frame deltas, so jank shows up as long frames attributed to the
// section of the page they happened in.
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";
const route = process.argv[2] ?? "/";
const throttle = Number(process.argv[3] ?? 1); // CPU slowdown multiplier

const browser = await chromium.launch({ args: ["--enable-gpu-rasterization"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

if (throttle > 1) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle });
}

await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
// Wait for the intro loader, then for the document height to stop changing:
// pinned sections only add their scroll length once ScrollTrigger has
// registered them, and sweeping before that covers half the page.
await page.waitForTimeout(6500);
await page.waitForFunction(
  () => {
    const h = document.body.scrollHeight;
    const stable = window.__lastH === h;
    window.__lastH = h;
    return stable;
  },
  null,
  { polling: 400, timeout: 20000 },
);

await page.evaluate(() => {
  window.__frames = [];
  let last = performance.now();
  const tick = (t) => {
    window.__frames.push({ d: t - last, y: window.scrollY });
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

// Scroll at a constant ~55px per frame for a realistic wheel-like sweep.
await page.evaluate(async () => {
  const h = document.body.scrollHeight - window.innerHeight;
  let y = 0;
  while (y < h) {
    y += 55;
    window.scrollTo(0, y);
    await new Promise((r) => requestAnimationFrame(r));
  }
});
await page.waitForTimeout(600);

const res = await page.evaluate(() => {
  const f = window.__frames.filter((x) => x.d > 0 && x.d < 2000).slice(5);
  const ds = f.map((x) => x.d).sort((a, b) => a - b);
  const pct = (p) => ds[Math.floor(ds.length * p)] ?? 0;
  const long = f.filter((x) => x.d > 32);
  // Bucket long frames by scroll depth so the worst stretch is identifiable.
  const buckets = {};
  const H = document.body.scrollHeight;
  for (const x of long) {
    const k = Math.floor((x.y / H) * 10) * 10;
    buckets[`${k}-${k + 10}%`] = (buckets[`${k}-${k + 10}%`] ?? 0) + 1;
  }
  return {
    frames: f.length,
    median: +pct(0.5).toFixed(1),
    p90: +pct(0.9).toFixed(1),
    p99: +pct(0.99).toFixed(1),
    worst: +Math.max(...ds).toFixed(1),
    longFrames: long.length,
    longPct: +((long.length / f.length) * 100).toFixed(1),
    buckets,
    docHeight: H,
  };
});

console.log(`${route}  (CPU ×${throttle})`);
console.log(JSON.stringify(res, null, 1));
await browser.close();
