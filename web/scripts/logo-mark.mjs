// Classy Captures — the mark.
//
// Two C's, the second smaller and set inside the first. It reads as CC; as a
// lens stopping down from one aperture to the next; and as two generations
// of the same studio, the younger working inside the elder's frame.
//
// Both mouths are cut on a single vertical, which is the detail that makes
// it look drawn rather than assembled: the gap angle of each C is derived
// from where that line falls on its own circle, not set by eye.
//
// Interlaced versions were tried and dropped. At this size relationship the
// small circle sits wholly inside the large one, so there is nothing to
// weave; forcing a crossing meant pushing the small C out until its mouth
// gaped, and the over/under notch read as a chip out of the large C rather
// than as a knot. Nested is cleaner and says the same thing.
export const R = (n) => Math.round(n * 100) / 100;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const pt = (cx, cy, r, d) => [R(cx + r * Math.cos(rad(d))), R(cy + r * Math.sin(rad(d)))];

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


/** Geometry of the mark, in a 0–240 box with the origin at its own centre. */
export const GEOM = {
  big: { cx: 104, cy: 120, r: 80, w: 22 },
  small: { cx: 136, cy: 120, r: 44, w: 22 },
  cut: 168, // the vertical both mouths are cut on
};

function withMouth(c, cutX) {
  const half = deg(Math.acos(Math.max(-1, Math.min(1, (cutX - c.cx) / c.r))));
  return { ...c, half };
}

/**
 * @param {number} scale
 * @param {{x?:number,y?:number}} at  translation applied after scaling
 */
export function markPaths(scale = 1, at = { x: 0, y: 0 }) {
  const s = (c) => ({
    cx: c.cx * scale + (at.x ?? 0),
    cy: c.cy * scale + (at.y ?? 0),
    r: c.r * scale,
    w: c.w * scale,
  });
  const big = withMouth(s(GEOM.big), GEOM.cut * scale + (at.x ?? 0));
  const small = withMouth(s(GEOM.small), GEOM.cut * scale + (at.x ?? 0));

  return [arcBar(big, big.half, 360 - big.half), arcBar(small, small.half, 360 - small.half)];
}

/** Bounding box of the mark at scale 1, before translation. */
export const MARK_BOX = {
  x: GEOM.big.cx - GEOM.big.r - GEOM.big.w / 2,
  y: GEOM.big.cy - GEOM.big.r - GEOM.big.w / 2,
  w: GEOM.big.r * 2 + GEOM.big.w,
  h: GEOM.big.r * 2 + GEOM.big.w,
};

/** Reduced form for small sizes: the outer C alone, a touch heavier. */
export function markSmallPaths(scale = 1, at = { x: 0, y: 0 }) {
  const c = {
    cx: GEOM.big.cx * scale + (at.x ?? 0),
    cy: GEOM.big.cy * scale + (at.y ?? 0),
    r: GEOM.big.r * scale,
    w: GEOM.big.w * 1.3 * scale,
  };
  const big = withMouth(c, GEOM.cut * scale + (at.x ?? 0));
  return [arcBar(big, big.half, 360 - big.half)];
}
