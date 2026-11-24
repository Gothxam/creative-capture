/**
 * Does a page actually share a grid — both ways?
 *
 * The first version of this script only checked vertical lines: where each
 * section's heading and content columns begin. That passed while the page
 * still looked wrong, because two columns can start in the right place and
 * then run down the page completely independently — one frame beginning at
 * 173px and overshooting its section, the next beginning at 243px and
 * stopping short.
 *
 * So it now reports horizontal lines too: the top and bottom edge of every
 * photograph in a section. Frames that belong to the same row should share
 * both, and the numbers below say whether they do.
 *
 *   node scripts/grid-check.mjs [route]
 */
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3100";
const route = process.argv[2] ?? "/about";

const browser = await chromium.launch();

for (const w of [1440, 1911]) {
  const page = await browser.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1 });
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(6500);
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 240));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);

  const rows = await page.evaluate(() =>
    [...document.querySelectorAll("section")].map((s, i) => {
      const kicker = s.querySelector(".u-mono.text-ember");
      const text = [...s.querySelectorAll("p")].find((p) => p.getBoundingClientRect().left > 200);
      // Every photograph in the section, with its edges relative to the
      // section's own top — absolute page coordinates are not comparable
      // between sections.
      const top = s.getBoundingClientRect().top;
      const frames = [...s.querySelectorAll("img")]
        .filter((img) => !img.closest("[data-track]"))
        .map((img) => {
          const r = img.getBoundingClientRect();
          return r.width > 60 && r.height > 60
            ? { t: Math.round(r.top - top), b: Math.round(r.bottom - top) }
            : null;
        })
        .filter(Boolean);
      const L = (el) => (el ? Math.round(el.getBoundingClientRect().left) : null);
      return {
        i,
        label: kicker?.textContent.trim().slice(0, 20) ?? "—",
        headLeft: L(kicker),
        contentLeft: L(text),
        tops: [...new Set(frames.map((f) => f.t))],
        bottoms: [...new Set(frames.map((f) => f.b))],
        count: frames.length,
      };
    }),
  );

  console.log(`\n=== ${w}px ===`);
  for (const r of rows) {
    const aligned = r.count < 2 ? "—" : r.tops.length === 1 && r.bottoms.length === 1 ? "aligned" : "RAGGED";
    console.log(
      ` ${r.label.padEnd(21)} head ${String(r.headLeft).padStart(5)}  content ${String(r.contentLeft).padStart(5)}` +
        `  frames ${String(r.count).padStart(2)}  tops ${JSON.stringify(r.tops).padEnd(12)} bottoms ${JSON.stringify(r.bottoms).padEnd(12)} ${aligned}`,
    );
  }
  const uniq = (a) => [...new Set(a.filter((x) => x != null))];
  console.log(
    ` vertical — head: ${uniq(rows.map((r) => r.headLeft)).join(", ")}   content: ${uniq(rows.map((r) => r.contentLeft)).join(", ")}`,
  );
  await page.close();
}
await browser.close();
