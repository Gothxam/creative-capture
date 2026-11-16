// Measures how the reference gallery actually moves: records every image's
// position at a series of scroll offsets and reports how far each moved
// relative to the scroll delta. A ratio of 1 means it tracks the page; less
// means it lags, more means it runs ahead.
import { chromium } from "playwright";

const URL = process.argv[2] ?? "https://vivmgmt.com/";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
await page.waitForTimeout(4000);

const structure = await page.evaluate(() => {
  const imgs = [...document.querySelectorAll("img")].filter(
    (i) => i.clientWidth > 80 && i.clientHeight > 80,
  );
  // Climb to the common ancestor that holds the most of them.
  const counts = new Map();
  for (const img of imgs) {
    let p = img.parentElement;
    for (let k = 0; k < 6 && p; k++) {
      counts.set(p, (counts.get(p) ?? 0) + 1);
      p = p.parentElement;
    }
  }
  const best = [...counts.entries()].filter(([, n]) => n >= imgs.length * 0.6).pop();
  const container = best?.[0];

  const bodyCS = getComputedStyle(document.body);
  return {
    imgCount: imgs.length,
    bodyOverflow: bodyCS.overflow,
    docScrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
    container: container
      ? {
          tag: container.tagName,
          cls: String(container.className).slice(0, 100),
          display: getComputedStyle(container).display,
          cols: getComputedStyle(container).gridTemplateColumns,
          children: container.children.length,
          childCls: [...container.children].slice(0, 6).map((c) => String(c.className).slice(0, 60)),
        }
      : null,
  };
});
console.log("STRUCTURE", JSON.stringify(structure, null, 1));

// Tag each image so it can be followed across samples.
await page.evaluate(() => {
  [...document.querySelectorAll("img")]
    .filter((i) => i.clientWidth > 80 && i.clientHeight > 80)
    .forEach((img, i) => (img.dataset.probe = String(i)));
});

const sample = () =>
  page.evaluate(() => {
    const out = {};
    document.querySelectorAll("[data-probe]").forEach((img) => {
      const r = img.getBoundingClientRect();
      out[img.dataset.probe] = { x: Math.round(r.left), y: Math.round(r.top), h: Math.round(r.height) };
    });
    // Whatever drives the page: the scroll offset or a wrapper transform.
    const wrappers = [...document.querySelectorAll("div,main,section")]
      .map((el) => ({ el, t: getComputedStyle(el).transform }))
      .filter((o) => o.t && o.t !== "none" && o.t.includes("matrix"))
      .slice(0, 4)
      .map((o) => ({ cls: String(o.el.className).slice(0, 40), t: o.t.slice(0, 60) }));
    return { scrollY: window.scrollY, wrappers, out };
  });

const STEPS = [0, 300, 600, 900];
const samples = [];
for (const y of STEPS) {
  await page.evaluate(async (target) => {
    const start = window.scrollY;
    const delta = target - start;
    for (let f = 1; f <= 30; f++) {
      window.scrollTo(0, start + (delta * f) / 30);
      await new Promise((r) => requestAnimationFrame(r));
    }
  }, y);
  await page.waitForTimeout(1200);
  samples.push(await sample());
}

console.log("\nSCROLL POSITIONS:", samples.map((s) => s.scrollY).join(", "));
console.log("WRAPPER TRANSFORMS AT LAST SAMPLE:", JSON.stringify(samples.at(-1).wrappers, null, 1));

// Movement ratio per image between the first and last sample.
const first = samples[0];
const last = samples.at(-1);
const scrolled = last.scrollY - first.scrollY;
const rows = [];
for (const k of Object.keys(first.out)) {
  if (!last.out[k]) continue;
  const dy = last.out[k].y - first.out[k].y;
  rows.push({
    i: Number(k),
    x: first.out[k].x,
    movedPx: dy,
    // 1.00 = perfectly tracks the page; <1 lags behind; >1 runs ahead.
    ratio: scrolled ? +(-dy / scrolled).toFixed(2) : 0,
  });
}
rows.sort((a, b) => a.x - b.x || a.i - b.i);

console.log(`\nscrolled ${scrolled}px — movement per image, grouped by column (x):`);
let lastX = null;
for (const r of rows) {
  if (r.x !== lastX) {
    console.log(`  — column x=${r.x}`);
    lastX = r.x;
  }
  console.log(`      img ${String(r.i).padStart(2)}  moved ${String(r.movedPx).padStart(6)}px  ratio ${r.ratio}`);
}

await browser.close();
