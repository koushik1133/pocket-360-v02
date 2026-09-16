import { brand } from "@/content/site";

const items = [
  "Shot on iPhone",
  "4K ProRes",
  "Shoot · Edit · Deliver",
  ...brand.locations,
  "Vertical 9:16",
  "Events · Brands · Creators",
] as const;

/**
 * Continuous ticker under the hero. Pure CSS animation on `transform`, so it
 * stays on the compositor; pauses on hover and stops entirely under
 * prefers-reduced-motion (see .marquee rules in globals.css).
 */
export function Marquee() {
  const track = [...items, ...items];
  return (
    <div className="marquee" aria-label="Pocket Reels 360 at a glance">
      <div className="marquee__track">
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="marquee__item"
            aria-hidden={index >= items.length ? true : undefined}
          >
            {item}
            <span className="marquee__dot" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
