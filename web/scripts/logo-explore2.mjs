// Round two: knot constructions.
//
// Round one established the direction — a knot, because a wedding is one
// being tied and a two-generation studio is a line that hasn't broken — but
// the construction was wrong. Two C's facing the same way can never weave:
// the left one's opening faces the right one's back, so their strokes never
// cross. Only an arrangement where the strokes genuinely cross can interlace.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "..", "brand", "explore");
fs.mkdirSync(OUT, { recursive: true });

const R = (n) => Math.round(n * 100) / 100;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const pt = (cx, cy, r, d) => [R(cx + r * Math.cos(rad(d))), R(cy + r * Math.sin(rad(d)))];

function arcBar(cx, cy, rMid, w, fromDeg, toDeg) {
  const ro = rMid + w / 2;
  const ri = rMid - w / 2;
  const sweepDeg = toDeg - fromDeg;
  const large = Math.abs(sweepDeg) > 180 ? 1 : 0;
  const sweep = sweepDeg > 0 ? 1 : 0;
  const [ox0, oy0] = pt(cx, cy, ro, fromDeg);
  const [ox1, oy1] = pt(cx, cy, ro, toDeg);
  const [ix1, iy1] = pt(cx, cy, ri, toDeg);
  const [ix0, iy0] = pt(cx, cy, ri, fromDeg);
  return `M ${ox0} ${oy0} A ${ro} ${ro} 0 ${large} ${sweep} ${ox1} ${oy1} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${large} ${1 - sweep} ${ix0} ${iy0} Z`;
}

/* 1 — INTERLOCK
   Mouths inward, backs outward: the only two-C arrangement whose strokes
   actually cross, and so the only one that can be woven. Two rings joined is
   also the oldest wedding image there is. */
function interlock(cx, cy, S = 1, { r = 84, w = 23, d = 46, gap = 76, span = 24 } = {}) {
  r *= S; w *= S; d *= S;
  const left = arcBar(cx - d, cy, r, w, gap / 2, 360 - gap / 2);
  const right = arcBar(cx + d, cy, r, w, 180 + gap / 2, 180 + 360 - gap / 2);
  // Crossing points of the two circles, as an angle on the left circle.
  const yc = Math.sqrt(Math.max(0, r * r - d * d));
  const aTop = deg(Math.atan2(-yc, d));
  const over = arcBar(cx - d, cy, r, w, aTop - span, aTop + span);
  return `    <path d="${left}"/>
    <path d="${right}"/>
    <path d="${over}"/>`;
}

/* 2 — HOOK
   The same two forms turned ninety degrees out of step, so they catch each
   other the way two links of a chain do. Asymmetric, and nothing like a
   fashion monogram. */
function hook(cx, cy, S = 1) {
  const r = 72 * S;
  const w = 23 * S;
  const d = 40 * S;
  const gap = 96;
  const a = arcBar(cx - d, cy - d * 0.5, r, w, gap / 2, 360 - gap / 2);
  const b = arcBar(cx + d, cy + d * 0.5, r, w, 90 + gap / 2, 90 + 360 - gap / 2);
  const yc = 0;
  const over = arcBar(cx - d, cy - d * 0.5, r, w, 42, 92);
  return `    <path d="${a}"/>
    <path d="${b}"/>
    <path d="${over}"/>`;
}

/* 3 — THE TIE
   One strand, one crossing: the moment a knot becomes a knot. Two loops of
   different size so it reads as a gesture rather than an infinity symbol. */
function tie(cx, cy, S = 1) {
  const w = 22 * S;
  const rA = 62 * S;
  const rB = 44 * S;
  const dx = 44 * S;
  const big = arcBar(cx - dx * 0.5, cy, rA, w, -150, 150);
  const small = arcBar(cx + dx * 0.9, cy, rB, w, 30, 330);
  const over = arcBar(cx - dx * 0.5, cy, rA, w, -34, 34);
  return `    <path d="${big}"/>
    <path d="${small}"/>
    <path d="${over}"/>`;
}

/* 4 — THE BAND
   Two rings, barely overlapping, woven once. The least decorated reading of
   the idea: joined, not entwined. */
function band(cx, cy, S = 1) {
  const r = 70 * S;
  const w = 21 * S;
  const d = 58 * S;
  const left = `M ${R(cx - d + r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx - d - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx - d + r)} ${R(cy)} Z M ${R(cx - d + r - w)} ${R(cy)} A ${R(r - w)} ${R(r - w)} 0 1 0 ${R(cx - d - r + w)} ${R(cy)} A ${R(r - w)} ${R(r - w)} 0 1 0 ${R(cx - d + r - w)} ${R(cy)} Z`;
  const right = left.replaceAll(`${R(cx - d + r)}`, "§1").replaceAll(`${R(cx - d - r)}`, "§2");
  // simpler: build the right ring explicitly
  const ring = (ccx) =>
    `M ${R(ccx + r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(ccx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(ccx + r)} ${R(cy)} Z M ${R(ccx + r - w)} ${R(cy)} A ${R(r - w)} ${R(r - w)} 0 1 0 ${R(ccx - r + w)} ${R(cy)} A ${R(r - w)} ${R(r - w)} 0 1 0 ${R(ccx + r - w)} ${R(cy)} Z`;
  const yc = Math.sqrt(Math.max(0, r * r - d * d));
  const aTop = deg(Math.atan2(-yc, d));
  const over = arcBar(cx - d, cy, r - w / 2, w, aTop - 22, aTop + 22);
  return `    <path fill-rule="evenodd" d="${ring(cx - d)}"/>
    <path fill-rule="evenodd" d="${ring(cx + d)}"/>
    <path d="${over}"/>`;
}

const MARKS = [
  ["1 · interlock", interlock],
  ["2 · hook", hook],
  ["3 · the tie", tie],
  ["4 · the band", band],
];

const CELL = 300;
const cells = MARKS.map(([label, fn], i) => {
  const x = (i % 2) * CELL;
  const y = Math.floor(i / 2) * CELL;
  return `  <g transform="translate(${x} ${y})">
  <g fill="#111010">
${fn(CELL / 2, CELL / 2 - 10)}
  </g>
    <text x="${CELL / 2}" y="${CELL - 20}" text-anchor="middle" font-family="monospace" font-size="13" fill="#8C877E">${label}</text>
  </g>`;
}).join("\n");

fs.writeFileSync(
  path.join(OUT, "_sheet2.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CELL * 2} ${CELL * 2}" width="${CELL * 2}" height="${CELL * 2}">
  <rect width="100%" height="100%" fill="#E7E4DD"/>
${cells}
</svg>
`,
);

for (const [label, fn] of MARKS) {
  const key = label.split("·")[1].trim().replace(/\s+/g, "-");
  fs.writeFileSync(
    path.join(OUT, `r2-${key}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">\n  <g fill="#111010">\n${fn(160, 160)}\n  </g>\n</svg>\n`,
  );
}

console.log(`${MARKS.length} knot constructions -> brand/explore`);
