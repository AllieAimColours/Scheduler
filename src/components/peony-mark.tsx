/**
 * PeonyMark — the Bloom brand mark.
 *
 * Renders the uploaded /icon.svg (Bloom RDV logo) at the requested size.
 * Used wherever a logo placeholder is needed (sidebar, install banner,
 * empty states). Matches the favicon + PWA icons since they all
 * pull from the same public/icon.svg file.
 */

/* eslint-disable @next/next/no-img-element */

interface Props {
  size?: number;
  className?: string;
}

export function PeonyMark({ size = 40, className }: Props) {
  return (
    <img
      src="/icon.svg"
      alt="Bloom"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
