// Camera marks, round two.
//
// Round one: the twin lens read as a remote control, and the seal lost the
// monogram. The body and the plate survived. Both are refined here, and the
// body is also tried solid — a filled silhouette with the lens knocked out,
// which is how a mark behaves when it has to work as a stamp, an emboss or
// a 20px avatar.
import fs from "node:fs";
import path from "node:path";
import { markPaths, MARK_BOX, R } from "./logo-mark.mjs";

const OUT = path.resolve(process.cwd(), "..", "brand", "explore");
fs.mkdirSync(OUT, { recursive: true });

const rrect = (x, y, w, h, r) =>
  `M ${R(x + r)} ${R(y)} L ${R(x + w - r)} ${R(y)} A ${R(r)} ${R(r)} 0 0 1 ${R(x + w)} ${R(y + r)} L ${R(x + w)} ${R(y + h - r)} A ${R(r)} ${R(r)} 0 0 1 ${R(x + w - r)} ${R(y + h)} L ${R(x + r)} ${R(y + h)} A ${R(r)} ${R(r)} 0 0 1 ${R(x)} ${R(y + h - r)} L ${R(x)} ${R(y + r)} A ${R(r)} ${R(r)} 0 0 1 ${R(x + r)} ${R(y)} Z`;

const circle = (cx, cy, r) =>
  `M ${R(cx + r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx - r)} ${R(cy)} A ${R(r)} ${R(r)} 0 1 1 ${R(cx + r)} ${R(cy)} Z`;

function ccLens(cx, cy, height) {
  const scale = height / MARK_BOX.h;
  return markPaths(scale, {
    x: cx - (MARK_BOX.x + MARK_BOX.w / 2) * scale,
    y: cy - (MARK_BOX.y + MARK_BOX.h / 2) * scale,
  });
}

/**
 * The body outline as one path: a rounded rectangle whose top edge steps up
 * once for the viewfinder. One step, not three — the prism, the hot shoe and
 * the dials are what made the original look like clip art.
 */
function bodyOutline({ x, y, w, h, r, stepX, stepW, stepH }) {
  return [
    `M ${R(x + r)} ${R(y)}`,
    `L ${R(x + stepX)} ${R(y)} L ${R(x + stepX)} ${R(y - stepH)} L ${R(x + stepX + stepW)} ${R(y - stepH)} L ${R(x + stepX + stepW)} ${R(y)}`,
    `L ${R(x + w - r)} ${R(y)}`,
    `A ${R(r)} ${R(r)} 0 0 1 ${R(x + w)} ${R(y + r)}`,
    `L ${R(x + w)} ${R(y + h - r)}`,
    `A ${R(r)} ${R(r)} 0 0 1 ${R(x + w - r)} ${R(y + h)}`,
    `L ${R(x + r)} ${R(y + h)}`,
    `A ${R(r)} ${R(r)} 0 0 1 ${R(x)} ${R(y + h - r)}`,
    `L ${R(x)} ${R(y + r)}`,
    `A ${R(r)} ${R(r)} 0 0 1 ${R(x + r)} ${R(y)}`,
    "Z",
  ].join(" ");
}

const BODY = { x: 20, y: 70, w: 200, h: 128, r: 28, stepX: 30, stepW: 48, stepH: 20 };
const LENS = { cx: 120, cy: 134 };

/* 1 — OUTLINE. The body drawn, the monogram solid inside it. */
function outlineCam() {
  const parts = [
    `<path fill="none" stroke="currentColor" stroke-width="17" stroke-linejoin="round" d="${bodyOutline(BODY)}"/>`,
  ];
  for (const d of ccLens(LENS.cx, LENS.cy, 90)) parts.push(`<path d="${d}"/>`);
  return parts.join("\n    ");
}

/* 2 — SOLID, MONOGRAM KNOCKED OUT. The lens is two C-shaped voids. */
function solidCam() {
  const d = `${bodyOutline(BODY)} ${ccLens(LENS.cx, LENS.cy, 92).join(" ")}`;
  return `<path fill-rule="evenodd" d="${d}"/>`;
}

/* 3 — SOLID, LENS AS AN APERTURE. A circular void with the monogram
   standing in it: body solid, lens hole, letters solid again. */
function apertureCam() {
  const d = `${bodyOutline(BODY)} ${circle(LENS.cx, LENS.cy, 54)} ${ccLens(LENS.cx, LENS.cy, 88).join(" ")}`;
  return `<path fill-rule="evenodd" d="${d}"/>`;
}

/* 4 — THE PLATE, refined. Focus brackets rather than a body: the frame a
   camera draws on what it is about to take. */
function plate() {
  const x = 30, y = 44, w = 180, h = 180, s = 18, notch = 52;
  const corner = (px, py, dx, dy) =>
    `M ${R(px + dx * notch)} ${R(py)} L ${R(px)} ${R(py)} L ${R(px)} ${R(py + dy * notch)}`;
  const marks = [
    corner(x, y, 1, 1),
    corner(x + w, y, -1, 1),
    corner(x + w, y + h, -1, -1),
    corner(x, y + h, 1, -1),
  ]
    .map((d) => `<path fill="none" stroke="currentColor" stroke-width="${s}" stroke-linecap="butt" d="${d}"/>`)
    .join("\n    ");
  const lens = ccLens(x + w / 2, y + h / 2, 112)
    .map((d) => `<path d="${d}"/>`)
    .join("\n    ");
  return `${marks}\n    ${lens}`;
}

const MARKS = [
  ["1 · outline", outlineCam],
  ["2 · solid", solidCam],
  ["3 · aperture", apertureCam],
  ["4 · plate", plate],
];

const CELL = 320;
const cells = MARKS.map(([label, fn], i) => {
  const x = (i % 2) * CELL;
  const y = Math.floor(i / 2) * CELL;
  return `  <g transform="translate(${x} ${y})" color="#111010">
    <g fill="#111010">
    ${fn()}
    </g>
    <text x="${CELL / 2}" y="${CELL - 14}" text-anchor="middle" font-family="monospace" font-size="13" fill="#8C877E">${label}</text>
  </g>`;
}).join("\n");

fs.writeFileSync(
  path.join(OUT, "_cameras2.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CELL * 2} ${CELL * 2}" width="${CELL * 2}" height="${CELL * 2}">
  <rect width="100%" height="100%" fill="#E7E4DD"/>
${cells}
</svg>
`,
);

for (const [label, fn] of MARKS) {
  const key = label.split("·")[1].trim().replace(/\s+/g, "-");
  fs.writeFileSync(
    path.join(OUT, `cam2-${key}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="320" height="320" color="#111010">\n  <g fill="#111010">\n    ${fn()}\n  </g>\n</svg>\n`,
  );
}

console.log(`${MARKS.length} refined camera marks -> brand/explore`);
