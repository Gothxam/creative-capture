/**
 * The studio mark.
 *
 * The supplied artwork, cut to transparency by scripts/logo-extract.mjs —
 * not a redrawing of it. It arrives as a flat PNG on a #f4f4f4 ground, so
 * that script keys the ground out and writes two copies: the black one for
 * paper, and one with the black recoloured for the dark sections. The
 * accent dot is detected by hue and survives both.
 *
 * Both copies are rendered and cross-faded rather than swapping one `src`.
 * The bar changes tone the moment you scroll off the hero, and a swap there
 * is a visible blink on the one element that should look fixed.
 */
export default function Mark({
  tone = "ink",
  className = "",
}: {
  /** `ink` for light grounds, `paper` for dark ones. */
  tone?: "ink" | "paper";
  className?: string;
}) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`} aria-hidden>
      {(["ink", "paper"] as const).map((t) => (
        <img
          key={t}
          src={`/brand/marks/cc-mark-${t}.png`}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain transition-opacity duration-300"
          style={{ opacity: tone === t ? 1 : 0 }}
        />
      ))}
    </span>
  );
}
