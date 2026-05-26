import Link from "next/link";

interface WordmarkProps {
  /** Displayed width in px. Height is derived from the cropped aspect (263:79). */
  width?: number;
  /** Wrap in a Link to "/" when truthy. Defaults to false (decorative hero usage). */
  href?: string | null;
  className?: string;
}

/**
 * Renders the "ONE DAY CALCULATOR" wordmark only.
 * Source asset (/logo.png, 263×101) has a small "CONVOY OF HOPE" tagline in the top
 * ~22px we don't want to display on the marketing homepage. We render the full image
 * shifted up inside an overflow-hidden window so only the wordmark shows.
 */
export default function Wordmark({ width = 360, href = null, className = "" }: WordmarkProps) {
  // Aspect math: full image is 263×101. Crop window keeps the bottom 79 rows.
  const display = {
    width,
    croppedHeight: Math.round(width * (79 / 263)),
    fullHeight: Math.round(width * (101 / 263)),
  };
  const offset = display.fullHeight - display.croppedHeight;

  const img = (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: display.width, height: display.croppedHeight, overflow: "hidden" }}
      aria-label="One Day Calculator"
      role="img"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        width={display.width}
        height={display.fullHeight}
        alt=""
        draggable={false}
        style={{ display: "block", marginTop: -offset }}
      />
    </div>
  );

  return href ? <Link href={href} aria-label="One Day Calculator home">{img}</Link> : img;
}
