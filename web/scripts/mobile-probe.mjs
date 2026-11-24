/**
 * What a phone actually gets.
 *
 * Reports, per section: how many photographs are on screen at once, whether
 * anything claims to scroll horizontally and can, and whether a section that
 * behaves one way on desktop quietly does nothing here.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";
const ROUTES = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/about", "/services", "/weddings", "/gallery"];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36",
});
const page = await ctx.newPage();

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(6500);
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += innerHeight * 0.8) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);

  const out = await page.evaluate(() => {
    // Anything that is meant to scroll sideways.
    const scrollers = [...document.querySelectorAll("*")]
      .filter((el) => {
        const o = getComputedStyle(el).overflowX;
        return (o === "auto" || o === "scroll") && el.scrollWidth > el.clientWidth + 4;
      })
      .map((el) => ({
        cls: (el.className?.toString?.() || "").slice(0, 70),
        scrollWidth: Math.round(el.scrollWidth),
        clientWidth: Math.round(el.clientWidth),
      }));

    // A track that is wide but sits in a container that cannot scroll is stuck.
    const stuck = [...document.querySelectorAll("[data-track]")].map((t) => {
      const parent = t.parentElement;
      const po = getComputedStyle(parent).overflowX;
      const to = getComputedStyle(t).overflowX;
      return {
        trackWidth: Math.round(t.scrollWidth),
        viewport: window.innerWidth,
        trackOverflowX: to,
        parentOverflowX: po,
        canScroll: (to === "auto" || to === "scroll") ? t.scrollWidth > t.clientWidth + 4
                 : (po === "auto" || po === "scroll") ? parent.scrollWidth > parent.clientWidth + 4
                 : false,
      };
    });

    // Photographs per screenful.
    const imgs = [...document.querySelectorAll("img, video")].filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 40 && r.height > 40;
    });
    const screens = document.body.scrollHeight / window.innerHeight;

    return { scrollers, stuck, photos: imgs.length, screens: +screens.toFixed(1),
             perScreen: +(imgs.length / screens).toFixed(1) };
  });
  console.log(route, JSON.stringify(out, null, 1));
}
await browser.close();
