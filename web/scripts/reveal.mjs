/**
 * Brightness of the viewport through the loader's exit.
 *
 * The curtain is made of ink panels sliding down, so the hero has to be
 * painted underneath before they move. If anything resets the first frame's
 * opacity as they go, the revealed strip is the section's own ink background
 * and the handover reads as a blink. A dip in mean luminance between the
 * curtain lifting and the photograph settling is exactly that blink.
 */
import { chromium } from "playwright";
import sharp from "sharp";

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 640 }, deviceScaleFactor: 1 });
await p.goto("http://localhost:3100/", { waitUntil: "domcontentloaded", timeout: 60000 });

const samples = [];
const STEPS = Number(process.argv[2] ?? 46);
for (let i = 0; i < STEPS; i++) {
  const shot = await p.screenshot({ type: "jpeg", quality: 55 });
  const { channels } = await sharp(shot).stats();
  const mean = (channels[0].mean + channels[1].mean + channels[2].mean) / 3;
  samples.push({ ms: i * 140, mean: +mean.toFixed(1) });
  await p.waitForTimeout(140);
}
await b.close();

// The curtain has lifted once the frame is no longer essentially black.
const lit = samples.findIndex((s) => s.mean > 40);
console.log("first lit frame:", lit >= 0 ? samples[lit].ms + "ms" : "never");
const after = samples.slice(Math.max(0, lit));
const dip = after.slice(1).find((s, i) => s.mean < after[i].mean * 0.6 && s.mean < 40);
console.log("dark dip after reveal:", dip ? `${dip.ms}ms -> mean ${dip.mean}` : "none");
// Any point that is darker than BOTH its neighbours by a real margin is an
// undershoot — the background showing through a transition rather than one
// photograph simply being darker than the last.
const dips = [];
for (let i = 1; i < after.length - 1; i++) {
  if (after[i].mean < after[i - 1].mean - 4 && after[i].mean < after[i + 1].mean - 4) {
    dips.push(
      `${after[i].ms}ms (${after[i - 1].mean} -> ${after[i].mean} -> ${after[i + 1].mean})`,
    );
  }
}
console.log("undershoots:", dips.length ? dips.join(", ") : "none");
console.log(after.map((s) => `${s.ms}:${s.mean}`).join("  "));
