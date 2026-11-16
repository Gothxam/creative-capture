// Visual QA: drives the real site in headless Chromium, scrolling in steps so
// every scroll-triggered animation actually fires, and writes screenshots.
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const OUT = path.resolve(process.cwd(), "..", "scrape", "shots");
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const ROUTES = process.argv[2]
  ? [process.argv[2]]
  : ["/", "/about", "/services", "/weddings", "/pre-wedding", "/portraits", "/films", "/gallery", "/contact"];

const device = process.argv[3] ?? "desktop";
const STEPS = Number(process.argv[4] ?? 8);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: VIEWPORTS[device],
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 240)));
page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`.slice(0, 240)));

for (const route of ROUTES) {
  const name = route === "/" ? "home" : route.replace(/\//g, "");
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
  // Let the intro loader finish and the first reveals settle.
  await page.waitForTimeout(6500);

  const height = await page.evaluate(() => document.body.scrollHeight);
  const vh = VIEWPORTS[device].height;
  const max = Math.max(0, height - vh);

  for (let i = 0; i < STEPS; i++) {
    const y = Math.round((max / Math.max(1, STEPS - 1)) * i);
    // Scroll in small increments so Lenis + ScrollTrigger see real motion
    // rather than one teleport that skips every trigger.
    await page.evaluate(async (target) => {
      const start = window.scrollY;
      const delta = target - start;
      const frames = 26;
      for (let f = 1; f <= frames; f++) {
        window.scrollTo(0, start + (delta * f) / frames);
        await new Promise((r) => requestAnimationFrame(r));
      }
    }, y);
    await page.waitForTimeout(950);
    await page.screenshot({ path: path.join(OUT, `${device}-${name}-${String(i).padStart(2, "0")}.png`) });
  }
  console.log(`${device} ${route.padEnd(14)} height ${height}px, ${STEPS} shots`);
}

await browser.close();
if (errors.length) {
  console.log("\nCONSOLE ERRORS:");
  [...new Set(errors)].forEach((e) => console.log("  -", e));
} else {
  console.log("\nNo console errors.");
}
