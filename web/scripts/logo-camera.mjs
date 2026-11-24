// Camera marks, explored.
//
// The brief is a camera. The original artwork's problem was never that it
// had one — it was that it had a *stock* one: a thin outline of a DSLR with
// a pentaprism, a hot shoe, a sparkle and a gradient, which is the same
// camera on ten thousand other photographers' logos.
//
// A camera can be premium. It needs to be reduced to the fewest strokes that
// still read, drawn at a weight that holds, and carry something only this
// studio owns. The nested CC built earlier becomes the lens in most of these
// — so the mark is a camera *and* the initials, not a camera with letters
// stuck beside it.
import fs from "node:fs";
import path from "node:path";
import { markPaths, MARK_BOX, R } from "./logo-mark.mjs";

const OUT = path.resolve(process.cwd(), "..", "brand", "explore");
fs.mkdirSync(OUT, { recursive: true });

/** Rounded rectangle as path data. */
const rrect = (x, y, w, h, r) =>
  `M ${R(x + r)} ${R(y)} L ${R(x + w - r)} ${R(y)} A ${R(r)} ${R(r)} 0 0 1 ${R(x + w)} ${R(y + r)} L ${R(x + w)} ${R(y + h - r)} A ${R(r)} ${R(r)} 0 0 1 ${R(x + w - r)} ${R(y + h)} L ${R(x + r)} ${R(y + h)} A ${R(r)} ${R(r)} 0 0 1 ${R(x)} ${R(y + h - r)} L ${R(x)} ${R(y + r)} A ${R(r)} ${R(r)} 0 0 1 ${R(x + r)} ${R(y)} Z`;

/** Ring as two circles, for use inside an evenodd path. */
const ring = (cx, cy, r, w) =>
  `M ${R(cx + r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx + r)} ${R(cy)} Z` +
  ` M ${R(cx + r - w)} ${R(cy)} A ${R(r - w)} ${R(r - w)} 0 1 1 ${R(cx - r + w)} ${R(cy)} A ${R(r - w)} ${R(r - w)} 0 1 1 ${R(cx + r - w)} ${R(cy)} Z`;

/** Places the nested-CC mark at a given height, centred on (cx, cy). */
function ccLens(cx, cy, height) {
  const scale = height / MARK_BOX.h;
  return markPaths(scale, {
    x: cx - (MARK_BOX.x + MARK_BOX.w / 2) * scale,
    y: cy - (MARK_BOX.y + MARK_BOX.h / 2) * scale,
  });
}

/* A — THE BODY
   A front view cut to three elements: body, a single viewfinder step, and
   the lens. No prism, no hot shoe, no dials. The lens is the monogram, so
   the camera and the initials are the same object. */
function bodyCam() {
  const bw = 196, bh = 136, bx = 22, by = 62, br = 26, s = 15;
  const parts = [
    `<path fill="none" stroke="currentColor" stroke-width="${s}" stroke-linejoin="round" d="${rrect(bx, by, bw, bh, br)}"/>`,
    `<path fill="none" stroke="currentColor" stroke-width="${s}" stroke-linejoin="round" stroke-linecap="round" d="M ${bx + 34} ${by} L ${bx + 34} ${by - 20} L ${bx + 74} ${by - 20} L ${bx + 74} ${by}"/>`,
  ];
  for (const d of ccLens(bx + bw / 2, by + bh / 2, 96)) parts.push(`<path d="${d}"/>`);
  return parts.join("\n    ");
}

/* B — THE TWIN LENS
   A twin-lens reflex: two stacked lenses, a tall body, nothing else. It is
   the most distinctive camera silhouette there is, it says film and craft
   rather than gear, and the two lenses are already two C's — an elder and a
   younger, which is literally this studio. */
function tlr() {
  const bw = 132, bh = 186, bx = 54, by = 34, br = 20, s = 15;
  const parts = [
    `<path fill="none" stroke="currentColor" stroke-width="${s}" stroke-linejoin="round" d="${rrect(bx, by, bw, bh, br)}"/>`,
    `<path fill-rule="evenodd" d="${ring(bx + bw / 2, by + 54, 27, 13)}"/>`,
  ];
  for (const d of ccLens(bx + bw / 2, by + 132, 82)) parts.push(`<path d="${d}"/>`);
  return parts.join("\n    ");
}

/* C — THE SEAL
   The camera cut out of a solid roundel, the way a studio stamp or a blind
   emboss works. Negative space does the drawing, so it survives being
   pressed into paper, foiled, or shown at 20px. */
function seal() {
  const cx = 120, cy = 124, R0 = 104;
  const bw = 118, bh = 78, bx = cx - bw / 2, by = cy - bh / 2 + 6, br = 16;
  const d =
    `M ${cx + R0} ${cy} A ${R0} ${R0} 0 1 1 ${cx - R0} ${cy} A ${R0} ${R0} 0 1 1 ${cx + R0} ${cy} Z ` +
    rrect(bx, by, bw, bh, br) +
    ` M ${bx + 26} ${by} L ${bx + 26} ${by - 16} L ${bx + 58} ${by - 16} L ${bx + 58} ${by} Z ` +
    ring(cx, by + bh / 2, 26, 11);
  return `<path fill-rule="evenodd" d="${d}"/>`;
}

/* D — THE APERTURE PLATE
   The body reduced to a square plate with the corners of a frame cut away,
   and the monogram as the lens. Closest to the archive language the site
   already uses — crop marks, contact sheets, slide mounts. */
function plate() {
  const x = 32, y = 36, w = 176, h = 176, s = 15, notch = 46;
  const corner = (px, py, dx, dy) =>
    `M ${R(px + dx * notch)} ${R(py)} L ${R(px)} ${R(py)} L ${R(px)} ${R(py + dy * notch)}`;
  const marks = [
    corner(x, y, 1, 1),
    corner(x + w, y, -1, 1),
    corner(x + w, y + h, -1, -1),
    corner(x, y + h, 1, -1),
  ]
    .map((d) => `<path fill="none" stroke="currentColor" stroke-width="${s}" stroke-linecap="square" d="${d}"/>`)
    .join("\n    ");
  const lens = ccLens(x + w / 2, y + h / 2, 118)
    .map((d) => `<path d="${d}"/>`)
    .join("\n    ");
  return `${marks}\n    ${lens}`;
}

const MARKS = [
  ["A · the body", bodyCam],
  ["B · the twin lens", tlr],
  ["C · the seal", seal],
  ["D · the plate", plate],
];

const CELL = 320;
const cells = MARKS.map(([label, fn], i) => {
  const x = (i % 2) * CELL;
  const y = Math.floor(i / 2) * CELL;
  return `  <g transform="translate(${x} ${y})" color="#111010">
    <g fill="#111010">
    ${fn()}
    </g>
    <text x="${CELL / 2}" y="${CELL - 16}" text-anchor="middle" font-family="monospace" font-size="13" fill="#8C877E">${label}</text>
  </g>`;
}).join("\n");

fs.writeFileSync(
  path.join(OUT, "_cameras.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CELL * 2} ${CELL * 2}" width="${CELL * 2}" height="${CELL * 2}">
  <rect width="100%" height="100%" fill="#E7E4DD"/>
${cells}
</svg>
`,
);

for (const [label, fn] of MARKS) {
  const key = label.split("·")[1].trim().replace(/\s+/g, "-");
  fs.writeFileSync(
    path.join(OUT, `cam-${key}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 248" width="320" height="331" color="#111010">\n  <g fill="#111010">\n    ${fn()}\n  </g>\n</svg>\n`,
  );
}

console.log(`${MARKS.length} camera directions -> brand/explore`);
