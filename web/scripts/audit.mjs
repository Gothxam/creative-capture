// Scrolls every route end to end and reports anything that stayed hidden,
// overflowed horizontally, or logged an error.
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";
const ROUTES = ["/", "/about", "/services", "/weddings", "/pre-wedding", "/portraits", "/films", "/gallery", "/contact"];
const VIEWPORTS = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

const device = process.argv[2] ?? "desktop";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORTS[device] });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
page.on("pageerror", (e) => errors.push(`PAGEERROR ${e.message}`.slice(0, 200)));

let bad = 0;

for (const route of ROUTES) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(6200);

  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y <= height; y += 170) {
    await page.evaluate((t) => window.scrollTo(0, t), y);
    await page.waitForTimeout(45);
  }
  await page.waitForTimeout(1800);

  const r = await page.evaluate(() => {
    const stuckMasks = [];
    const hiddenReveals = [];
    document.querySelectorAll("[data-mask] > span").forEach((s) => {
      const m = getComputedStyle(s).transform;
      const y = m === "none" ? 0 : parseFloat(m.split(",")[5] || "0");
      if (Math.abs(y) > 2) stuckMasks.push(s.textContent.trim().slice(0, 24));
    });
    document.querySelectorAll("[data-reveal],[data-reveal-children] > *").forEach((e) => {
      if (parseFloat(getComputedStyle(e).opacity) < 0.9)
        hiddenReveals.push(e.textContent.trim().slice(0, 26) || e.tagName);
    });
    return {
      stuckMasks,
      hiddenReveals,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      height: document.body.scrollHeight,
    };
  });

  const problems = [];
  if (r.stuckMasks.length) problems.push(`stuck masks: ${r.stuckMasks.join(" | ")}`);
  if (r.hiddenReveals.length) problems.push(`hidden reveals: ${r.hiddenReveals.join(" | ")}`);
  if (r.overflow > 1) problems.push(`H-OVERFLOW ${r.overflow}px`);
  if (problems.length) bad++;

  console.log(
    `${problems.length ? "FAIL" : "ok  "} ${device} ${route.padEnd(13)} ${String(r.height).padStart(6)}px  ${problems.join("; ")}`,
  );
}

await browser.close();
const unique = [...new Set(errors)];
console.log(unique.length ? `\nCONSOLE ERRORS:\n  ${unique.join("\n  ")}` : "\nNo console errors.");
console.log(bad ? `\n${bad} route(s) with problems.` : "\nAll routes clean.");
