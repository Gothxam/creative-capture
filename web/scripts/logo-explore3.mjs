// Round three: two C's of different size, interlocked.
//
// Round two showed the symmetric two-ring interlock reads as a figure-eight
// and sits too close to a certain fashion monogram. Making the second C
// smaller fixes both: the silhouette stops being symmetrical, and the size
// step gives the mark a second meaning — a lens stopping down, an elder and
// a younger, the second generation inside the first.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "..", "brand", "explore");
fs.mkdirSync(OUT, { recursive: true });

const R = (n) => Math.round(n * 100) / 100;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const pt = (cx, cy, r, d) => [R(cx + r * Math.cos(rad(d))), R(cy + r * Math.sin(rad(d)))];
const norm = (a) => ((a % 360) + 360) % 360;

function arcBar({ cx, cy, r, w }, fromDeg, toDeg) {
  const ro = r + w / 2;
  const ri = r - w / 2;
  const d = toDeg - fromDeg;
  const large = Math.abs(d) > 180 ? 1 : 0;
  const sweep = d > 0 ? 1 : 0;
  const [ox0, oy0] = pt(cx, cy, ro, fromDeg);
  const [ox1, oy1] = pt(cx, cy, ro, toDeg);
  const [ix1, iy1] = pt(cx, cy, ri, toDeg);
  const [ix0, iy0] = pt(cx, cy, ri, fromDeg);
  return `M ${ox0} ${oy0} A ${ro} ${ro} 0 ${large} ${sweep} ${ox1} ${oy1} L ${ix1} ${iy1} A ${ri} ${ri} 0 ${large} ${1 - sweep} ${ix0} ${iy0} Z`;
}

/** The C itself: a ring with a mouth. */
const cShape = (s) => arcBar(s, s.mouth + s.gap / 2, s.mouth + 360 - s.gap / 2);

/** Angles, on circle A, at which A and B cross. */
function crossings(a, b) {
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  const dist = Math.hypot(dx, dy);
  if (dist > a.r + b.r || dist < Math.abs(a.r - b.r) || dist === 0) return [];
  const base = deg(Math.atan2(dy, dx));
  const cosT = (dist * dist + a.r * a.r - b.r * b.r) / (2 * dist * a.r);
  const t = deg(Math.acos(Math.max(-1, Math.min(1, cosT))));
  return [norm(base + t), norm(base - t)];
}

/** Is `angle` on the drawn part of this C (i.e. not inside its mouth)? */
function onStroke(s, angle) {
  const rel = norm(angle - s.mouth);
  return rel > s.gap / 2 && rel < 360 - s.gap / 2;
}

/**
 * Draws two C's woven together: B over A everywhere except at the first
 * crossing that lies on both strokes, where A is redrawn on top.
 */
function weave(a, b, span = 20) {
  const parts = [`    <path d="${cShape(a)}"/>`, `    <path d="${cShape(b)}"/>`];
  const pts = crossings(a, b).filter((ang) => onStroke(a, ang) && onStroke(b, norm(deg(Math.atan2(a.cy + a.r * Math.sin(rad(ang)) - b.cy, a.cx + a.r * Math.cos(rad(ang)) - b.cx)))));
  if (pts.length) {
    parts.push(`    <path d="${arcBar(a, pts[0] - span, pts[0] + span)}"/>`);
  }
  return parts.join("\n");
}

/* Four readings of the same idea. */
const VARIANTS = {
  "a · beside": () => {
    const big = { cx: 128, cy: 160, r: 74, w: 23, mouth: 0, gap: 88 };
    const small = { cx: 196, cy: 160, r: 46, w: 23, mouth: 0, gap: 88 };
    return weave(big, small);
  },
  "b · within": () => {
    const big = { cx: 150, cy: 160, r: 78, w: 23, mouth: 0, gap: 84 };
    const small = { cx: 186, cy: 160, r: 44, w: 23, mouth: 180, gap: 84 };
    return weave(big, small);
  },
  "c · turned": () => {
    const big = { cx: 140, cy: 150, r: 74, w: 23, mouth: 0, gap: 90 };
    const small = { cx: 190, cy: 192, r: 46, w: 23, mouth: 270, gap: 90 };
    return weave(big, small);
  },
  "d · stopped down": () => {
    const big = { cx: 146, cy: 160, r: 80, w: 22, mouth: 0, gap: 76 };
    const small = { cx: 176, cy: 160, r: 44, w: 22, mouth: 0, gap: 76 };
    return weave(big, small);
  },
};

const CELL = 320;
const keys = Object.keys(VARIANTS);
const cells = keys
  .map((k, i) => {
    const x = (i % 2) * CELL;
    const y = Math.floor(i / 2) * CELL;
    return `  <g transform="translate(${x} ${y})">
  <g fill="#111010">
${VARIANTS[k]()}
  </g>
    <text x="${CELL / 2}" y="${CELL - 18}" text-anchor="middle" font-family="monospace" font-size="13" fill="#8C877E">${k}</text>
  </g>`;
  })
  .join("\n");

fs.writeFileSync(
  path.join(OUT, "_sheet3.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CELL * 2} ${CELL * 2}" width="${CELL * 2}" height="${CELL * 2}">
  <rect width="100%" height="100%" fill="#E7E4DD"/>
${cells}
</svg>
`,
);

for (const k of keys) {
  const key = k.split("·")[1].trim().replace(/\s+/g, "-");
  fs.writeFileSync(
    path.join(OUT, `r3-${key}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320">\n  <g fill="#111010">\n${VARIANTS[k]()}\n  </g>\n</svg>\n`,
  );
}

console.log(`${keys.length} variants -> brand/explore`);
