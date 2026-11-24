/**
 * The dot grid, for sections that paint their own ground.
 *
 * The body carries the field for the whole page, but any section with a
 * background of its own covers it — so the dark sections have to re-state
 * it, in white rather than ink.
 *
 * It is a plain background image on an in-flow layer: no blend mode and no
 * fixed positioning, both of which were measured earlier in this project as
 * the largest source of dropped frames on the home page. `.u-dots` draws
 * from `currentColor`, so the alpha is set here as a text colour.
 */
export default function DotField({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`u-dots pointer-events-none absolute inset-0 text-white/15 ${className}`}
    />
  );
}
