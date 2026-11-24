/**
 * Frame times through a real wheel-driven scroll, bucketed by what is on
 * screen when each slow frame lands.
 *
 * Two earlier versions of this probe were wrong in ways worth recording.
 * The first scrolled with `window.scrollTo`, which goes straight to a
 * position and never touches Lenis — it measured a path the site does not
 * use and called a visibly stuttering section smooth. The second reported
 * pin length from the track's own width rather than from the trigger, so it
 * kept printing the old number after the pin had been shortened.
 *
 * This one dispatches real wheel events and asks ScrollTrigger what it
 * actually set up.
 *
 *   node scripts/jitter.mjs [notches]
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";
const NOTCHES = Number(process.argv[2] ?? 260);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(7000);

// What each section occupies, so a slow frame can be attributed to one.
const map = await page.evaluate(() =>
  [...document.querySelectorAll("section, div[data-band]")].map((s) => {
    const r = s.getBoundingClientRect();
    const id =
      s.querySelector("[data-track]") ? "work"
      : s.querySelector("[data-pin]") ? "story"
      : s.querySelector("[data-frame]") ? "hero"
      : s.querySelector("[data-parallax]") ? "philosophy"
      : s.querySelector("[data-stat]") ? "stats"
      : (s.className || "").includes("bg-ink") ? "dark"
      : "other";
    return { id, top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY) };
  }),
);

const pins = await page.evaluate(() =>
  (window.ScrollTrigger?.getAll?.() ?? [])
    .filter((t) => t.pin)
    .map((t) => ({ start: Math.round(t.start), end: Math.round(t.end), screens: +(((t.end - t.start) / innerHeight).toFixed(1)) })),
);

await page.evaluate(() => {
  window.__s = [];
  let last = performance.now();
  window.__run = true;
  const tick = (now) => {
    window.__s.push([now - last, window.scrollY]);
    last = now;
    if (window.__run) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});

await page.mouse.move(720, 450);
for (let i = 0; i < NOTCHES; i++) {
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(16);
}
await page.waitForTimeout(400);

const res = await page.evaluate((sections) => {
  window.__run = false;
  const s = window.__s.slice(8);
  const times = s.map((x) => x[0]).sort((a, b) => a - b);
  const q = (f) => +times[Math.max(0, Math.floor(times.length * f) - 1)].toFixed(1);

  const where = (y) => {
    const mid = y + window.innerHeight / 2;
    const hit = sections.find((x) => mid >= x.top && mid < x.bottom && x.id !== "other");
    return hit ? hit.id : "other";
  };

  const slow = {};
  const seen = {};
  for (const [dt, y] of s) {
    const k = where(y);
    seen[k] = (seen[k] ?? 0) + 1;
    if (dt > 20) slow[k] = (slow[k] ?? 0) + 1;
  }
  const bySection = Object.keys(seen)
    .map((k) => ({ section: k, frames: seen[k], slow: slow[k] ?? 0, pct: +(((slow[k] ?? 0) / seen[k]) * 100).toFixed(1) }))
    .sort((a, b) => b.pct - a.pct);

  return {
    frames: times.length,
    median: q(0.5),
    p90: q(0.9),
    p99: q(0.99),
    worst: +times[times.length - 1].toFixed(1),
    over20ms: +((times.filter((v) => v > 20).length / times.length) * 100).toFixed(1),
    travelled: Math.round(s[s.length - 1][1] - s[0][1]),
    bySection,
  };
}, map);

console.log(JSON.stringify({ ...res, pins }, null, 1));
await browser.close();
