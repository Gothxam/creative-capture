// Mark exploration. Four distinct directions, drawn to the same frame so they
// can be judged against each other rather than one at a time.
//
// Ruled out before drawing anything: cameras, lenses, apertures, shutters,
// film strips, viewfinders, sparkles, concentric circles. Those are the
// shapes every photographer's logo already uses.
//
// What this studio actually has that nobody else does: thirty years and two
// generations, South Indian weddings, and a site built around the idea of an
// archive. The directions below come from that, not from the equipment.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "..", "brand", "explore");
fs.mkdirSync(OUT, { recursive: true });

const R = (n) => Math.round(n * 100) / 100;
const rad = (d) => (d * Math.PI) / 180;
const pt = (cx, cy, r, d) => [R(cx + r * Math.cos(rad(d))), R(cy + r * Math.sin(rad(d)))];

/** Ring segment with flat terminals cut square to the radius. */
function arcBar(cx, cy, rMid, w, fromDeg, toDeg) {
  const ro = rMid + w / 2;
  const ri = rMid - w / 2;
  const large = Math.abs(toDeg - fromDeg) > 180 ? 1 : 0;
  const sweep = toDeg > fromDeg ? 1 : 0;
  const [ox0, oy0] = pt(cx, cy, ro, fromDeg);
  const [ox1, oy1] = pt(cx, cy, ro, toDeg);
  const [ix1, iy1] = pt(cx, cy, ri, toDeg);
  const [ix0, iy0] = pt(cx, cy, ri, fromDeg);
  return [
    `M ${ox0} ${oy0}`,
    `A ${ro} ${ro} 0 ${large} ${sweep} ${ox1} ${oy1}`,
    `L ${ix1} ${iy1}`,
    `A ${ri} ${ri} 0 ${large} ${1 - sweep} ${ix0} ${iy0}`,
    "Z",
  ].join(" ");
}

/* ───────────────────────────────────────────────────────────────────────
   A — THE KNOT
   Two C's, overlapped and woven: one passes over at the top crossing and
   under at the bottom, so the pair genuinely interlocks rather than merely
   overlapping. A wedding is a knot being tied; a family business is a line
   that doesn't break. It reads as CC, as two linked bands, and as a knot.
   ─────────────────────────────────────────────────────────────────────── */
function knot(cx, cy, S = 1) {
  const r = 86 * S;
  const w = 25 * S;
  const d = 50 * S; // half the distance between the two centres
  const gap = 64; // opening of each C, degrees

  const from = gap / 2;
  const to = 360 - gap / 2;

  const left = arcBar(cx - d, cy, r, w, from, to);
  const right = arcBar(cx + d, cy, r, w, from, to);

  // Where the two circles cross, as an angle on the LEFT circle.
  const yCross = Math.sqrt(Math.max(0, r * r - d * d));
  const topAngle = (Math.atan2(-yCross, d) * 180) / Math.PI;
  const span = 26;
  // Re-drawing this slice of the left C on top puts it over the right one
  // at the top crossing, while the right stays over at the bottom.
  const overlap = arcBar(cx - d, cy, r, w, topAngle - span, topAngle + span);

  return `    <path d="${left}"/>
    <path d="${right}"/>
    <path d="${overlap}"/>`;
}

/* ───────────────────────────────────────────────────────────────────────
   B — THE KOLAM
   A pulli kolam is the looping line drawn around a grid of dots at a South
   Indian threshold every morning, and at weddings. It is made in one
   continuous stroke that never lifts. Four loops around four points, with
   the crossings left visible the way a real kolam shows them.
   ─────────────────────────────────────────────────────────────────────── */
function kolam(cx, cy, S = 1) {
  const r = 58 * S;
  const w = 16 * S;
  const spread = 56 * S;
  const dot = 7 * S;
  const loops = [];
  const dots = [];
  for (let i = 0; i < 4; i++) {
    const a = 45 + i * 90;
    const [x, y] = pt(cx, cy, spread, a);
    loops.push(
      `    <circle cx="${x}" cy="${y}" r="${R(r)}" fill="none" stroke-width="${R(w)}"/>`,
    );
    dots.push(`    <circle cx="${x}" cy="${y}" r="${R(dot)}"/>`);
  }
  return `  <g stroke="currentColor" fill="none">
${loops.join("\n")}
  </g>
  <g fill="currentColor">
${dots.join("\n")}
    <circle cx="${R(cx)}" cy="${R(cy)}" r="${R(dot)}"/>
  </g>`;
}

/* ───────────────────────────────────────────────────────────────────────
   C — THE THRESHOLD
   A C turned ninety degrees is an arch. Nest two and you have the toran a
   couple is married under, the gopuram of a South Indian temple, and a
   doorway — two generations standing in the same opening. Still CC, just
   not read left to right.
   ─────────────────────────────────────────────────────────────────────── */
function threshold(cx, cy, S = 1) {
  const w = 24 * S;
  const outerR = 92 * S;
  const innerR = 50 * S;
  const foot = 70 * S; // how far the legs drop below the springing line
  const top = cy - 26 * S;

  const arch = (rr) => {
    const ro = rr + w / 2;
    const ri = rr - w / 2;
    const yFoot = top + foot;
    return [
      `M ${R(cx - ro)} ${R(yFoot)}`,
      `L ${R(cx - ro)} ${R(top)}`,
      `A ${R(ro)} ${R(ro)} 0 0 1 ${R(cx + ro)} ${R(top)}`,
      `L ${R(cx + ro)} ${R(yFoot)}`,
      `L ${R(cx + ri)} ${R(yFoot)}`,
      `L ${R(cx + ri)} ${R(top)}`,
      `A ${R(ri)} ${R(ri)} 0 0 0 ${R(cx - ri)} ${R(top)}`,
      `L ${R(cx - ri)} ${R(yFoot)}`,
      "Z",
    ].join(" ");
  };

  return `    <path d="${arch(outerR)}"/>
    <path d="${arch(innerR)}"/>`;
}

/* ───────────────────────────────────────────────────────────────────────
   D — THE UNBROKEN LINE
   One stroke that turns back through itself: a C whose terminals cross
   rather than stop. The same idea as the kolam — a line that never lifts —
   reduced to a single gesture. "Moments made everlasting" with no loose end.
   ─────────────────────────────────────────────────────────────────────── */
function unbroken(cx, cy, S = 1) {
  const r = 84 * S;
  const w = 24 * S;
  const gap = 96;
  const from = gap / 2;
  const to = 360 - gap / 2;
  const body = arcBar(cx, cy, r, w, from, to);

  // Both terminals continue inward and cross in the opening.
  const inner = r * 0.44;
  const [ax, ay] = pt(cx, cy, r, from);
  const [bx, by] = pt(cx, cy, r, to);
  const [ix, iy] = pt(cx, cy, inner, to + 34);
  const [jx, jy] = pt(cx, cy, inner, from - 34);
  const tail = (x0, y0, x1, y1) =>
    `M ${x0} ${y0} Q ${R(cx + (x0 - cx) * 0.45)} ${R(cy + (y0 - cy) * 0.45)} ${x1} ${y1}`;

  return `    <path d="${body}"/>
  <g fill="none" stroke="currentColor" stroke-width="${R(w)}" stroke-linecap="butt">
    <path d="${tail(ax, ay, ix, iy)}"/>
    <path d="${tail(bx, by, jx, jy)}"/>
  </g>`;
}

/* ── sheet ─────────────────────────────────────────────────────────────── */

const MARKS = [
  ["A · the knot", knot, true],
  ["B · the kolam", kolam, false],
  ["C · the threshold", threshold, true],
  ["D · the unbroken line", unbroken, true],
];

const CELL = 300;
const cells = MARKS.map(([label, fn, filled], i) => {
  const x = (i % 2) * CELL;
  const y = Math.floor(i / 2) * CELL;
  const inner = filled ? `  <g fill="currentColor">\n${fn(CELL / 2, CELL / 2 - 8)}\n  </g>` : fn(CELL / 2, CELL / 2 - 8);
  return `  <g transform="translate(${x} ${y})" color="#111010">
${inner}
    <text x="${CELL / 2}" y="${CELL - 22}" text-anchor="middle" font-family="monospace" font-size="13" fill="#8C877E">${label}</text>
  </g>`;
}).join("\n");

const sheet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CELL * 2} ${CELL * 2}" width="${CELL * 2}" height="${CELL * 2}">
  <rect width="100%" height="100%" fill="#E7E4DD"/>
${cells}
</svg>
`;
fs.writeFileSync(path.join(OUT, "_sheet.svg"), sheet);

// Each one on its own, transparent, for a closer look.
for (const [label, fn, filled] of MARKS) {
  const key = label.split("·")[1].trim().replace(/\s+/g, "-");
  const inner = filled ? `  <g fill="currentColor">\n${fn(160, 160)}\n  </g>` : fn(160, 160);
  fs.writeFileSync(
    path.join(OUT, `${key}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320" width="320" height="320" color="#111010">\n${inner}\n</svg>\n`,
  );
}

console.log(`${MARKS.length} directions -> brand/explore`);
