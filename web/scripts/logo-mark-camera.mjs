// Classy Captures — the camera mark.
//
// A camera reduced to two elements: a body and a lens. No pentaprism, no hot
// shoe, no dials, no sparkle — those are what made the original artwork read
// as clip art. One viewfinder step is enough to say "camera"; everything
// else was decoration.
//
// The lens is not a lens shape. It is the studio's monogram — two C's, the
// second nested inside the first (see logo-mark.mjs) — standing in a
// circular void cut out of the solid body. So the camera and the initials
// are the same object rather than a picture with letters beside it, and the
// mark is built from three levels of fill: body solid, lens hole, letters
// solid again.
import { markPaths, MARK_BOX, R } from "./logo-mark.mjs";

/** Body geometry, in a 240-wide box. */
export const BODY = {
  x: 20,
  y: 72,
  w: 200,
  h: 126,
  r: 30,
  stepX: 28, // viewfinder step, from the body's left edge
  stepW: 56,
  stepH: 15,
};
export const LENS = { r: 58, cc: 96 };

const cx = BODY.x + BODY.w / 2;
const cy = BODY.y + BODY.h / 2;

const circle = (ccx, ccy, r) =>
  `M ${R(ccx + r)} ${R(ccy)} A ${R(r)} ${R(r)} 0 1 1 ${R(ccx - r)} ${R(ccy)} A ${R(r)} ${R(r)} 0 1 1 ${R(ccx + r)} ${R(ccy)} Z`;

function bodyPath(b = BODY) {
  return [
    `M ${R(b.x + b.r)} ${R(b.y)}`,
    `L ${R(b.x + b.stepX)} ${R(b.y)} L ${R(b.x + b.stepX)} ${R(b.y - b.stepH)} L ${R(b.x + b.stepX + b.stepW)} ${R(b.y - b.stepH)} L ${R(b.x + b.stepX + b.stepW)} ${R(b.y)}`,
    `L ${R(b.x + b.w - b.r)} ${R(b.y)}`,
    `A ${R(b.r)} ${R(b.r)} 0 0 1 ${R(b.x + b.w)} ${R(b.y + b.r)}`,
    `L ${R(b.x + b.w)} ${R(b.y + b.h - b.r)}`,
    `A ${R(b.r)} ${R(b.r)} 0 0 1 ${R(b.x + b.w - b.r)} ${R(b.y + b.h)}`,
    `L ${R(b.x + b.r)} ${R(b.y + b.h)}`,
    `A ${R(b.r)} ${R(b.r)} 0 0 1 ${R(b.x)} ${R(b.y + b.h - b.r)}`,
    `L ${R(b.x)} ${R(b.y + b.r)}`,
    `A ${R(b.r)} ${R(b.r)} 0 0 1 ${R(b.x + b.r)} ${R(b.y)}`,
    "Z",
  ].join(" ");
}

/** The monogram, scaled and centred on the lens. */
function ccAt(height) {
  const s = height / MARK_BOX.h;
  return markPaths(s, {
    x: cx - (MARK_BOX.x + MARK_BOX.w / 2) * s,
    y: cy - (MARK_BOX.y + MARK_BOX.h / 2) * s,
  });
}

/** Untransformed bounding box, including the viewfinder step. */
export const CAMERA_BOX = {
  x: BODY.x,
  y: BODY.y - BODY.stepH,
  w: BODY.w,
  h: BODY.h + BODY.stepH,
};

/**
 * The full mark as a single evenodd path: body, lens void, monogram.
 * One path means one fill, so it can be recoloured, foiled or knocked out
 * without any of the parts coming apart.
 */
export function cameraPath() {
  return `${bodyPath()} ${circle(cx, cy, LENS.r)} ${ccAt(LENS.cc).join(" ")}`;
}

/**
 * Reduced form for small sizes: body and a plain lens void. Below about
 * 28px the two C's inside the lens close up into a blot, and a clean hole
 * reads better than a smudge.
 */
export function cameraSmallPath() {
  return `${bodyPath()} ${circle(cx, cy, LENS.r * 0.72)}`;
}

/** Outline form, for embroidery, engraving and light-on-dark watermarks. */
export function cameraOutline() {
  return {
    stroke: bodyPath(),
    strokeWidth: 17,
    fill: ccAt(LENS.cc).join(" "),
  };
}
