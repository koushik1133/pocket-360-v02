"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { WorkItem } from "@/content/site";
import { PlayIcon } from "@/components/icons";

type RallyGalleryProps = {
  items: readonly WorkItem[];
  onSelectItem: (item: WorkItem) => void;
};

type RowConfig = {
  id: number;
  baseSpeed: number;
  direction: 1 | -1;
  cardWidth: number;
  cardHeight: number;
  opacity: number;
  scale: number;
  zIndex: number;
};

const rowConfigs: RowConfig[] = [
  {
    id: 1,
    baseSpeed: 0.22,
    direction: 1,
    cardWidth: 190,
    cardHeight: 255,
    opacity: 0.72,
    scale: 0.92,
    zIndex: 1,
  },
  {
    id: 2,
    baseSpeed: 0.45,
    direction: -1,
    cardWidth: 230,
    cardHeight: 310,
    opacity: 0.88,
    scale: 0.96,
    zIndex: 2,
  },
  {
    id: 3,
    baseSpeed: 0.95,
    direction: 1,
    cardWidth: 280,
    cardHeight: 380,
    opacity: 1.0,
    scale: 1.0,
    zIndex: 5,
  },
  {
    id: 4,
    baseSpeed: 0.52,
    direction: -1,
    cardWidth: 230,
    cardHeight: 310,
    opacity: 0.88,
    scale: 0.96,
    zIndex: 2,
  },
  {
    id: 5,
    baseSpeed: 0.26,
    direction: 1,
    cardWidth: 190,
    cardHeight: 255,
    opacity: 0.72,
    scale: 0.92,
    zIndex: 1,
  },
];

export function RallyGallery({ items, onSelectItem }: RallyGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const offsetsRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const scrollVelocityRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState<number | null>(null);

  // Distribute items across the 5 rows with staggered offsets for natural variation
  const rowItems = useMemo(() => {
    if (!items.length) return [];
    return rowConfigs.map((_, rowIndex) => {
      const len = items.length;
      const shift = (rowIndex * 2) % len;
      const rotated = [...items.slice(shift), ...items.slice(0, shift)];
      let stream = [...rotated];
      while (stream.length < 8) {
        stream = [...stream, ...rotated];
      }
      return [...stream, ...stream, ...stream];
    });
  }, [items]);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // Track vertical scroll velocity
    let scrollTimeout: NodeJS.Timeout;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollYRef.current;
      lastScrollYRef.current = currentY;

      scrollVelocityRef.current = delta * 0.12;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollVelocityRef.current = 0;
      }, 120);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    let animationFrameId: number;

    const tick = () => {
      animationFrameId = requestAnimationFrame(tick);

      // Decay scroll velocity back to 0
      scrollVelocityRef.current *= 0.92;

      rowConfigs.forEach((config, index) => {
        const rowEl = rowsRef.current[index];
        if (!rowEl) return;

        const speed =
          config.baseSpeed * config.direction +
          scrollVelocityRef.current * (config.direction * 0.5 + 0.5);

        const hoverMultiplier = isHovered === index ? 0.2 : 1.0;

        offsetsRef.current[index] =
          (offsetsRef.current[index] || 0) + speed * hoverMultiplier;

        const totalWidth = rowEl.scrollWidth / 3;
        if (totalWidth > 0) {
          if (offsetsRef.current[index] > 0) {
            offsetsRef.current[index] -= totalWidth;
          } else if (offsetsRef.current[index] < -totalWidth) {
            offsetsRef.current[index] += totalWidth;
          }
        }

        rowEl.style.transform = `translate3d(${offsetsRef.current[index]}px, 0, 0)`;
      });
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(scrollTimeout);
    };
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className="rally-stream relative w-full overflow-hidden py-10 select-none"
      aria-label="Pocket Reels 360 Rally Wall"
    >
      {/* Ambient gradient vignettes on edges */}
      <div className="rally-vignette rally-vignette--left pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-24 md:w-48 bg-gradient-to-r from-[var(--color-ivory)] to-transparent" />
      <div className="rally-vignette rally-vignette--right pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-24 md:w-48 bg-gradient-to-l from-[var(--color-ivory)] to-transparent" />

      <div className="rally-rows flex flex-col gap-4 md:gap-6">
        {rowConfigs.map((config, rowIndex) => (
          <div
            key={config.id}
            className={`rally-row rally-row--${config.id} relative flex overflow-visible`}
            style={{
              zIndex: config.zIndex,
              opacity: config.opacity,
            }}
            onMouseEnter={() => setIsHovered(rowIndex)}
            onMouseLeave={() => setIsHovered(null)}
          >
            <div
              ref={(el) => {
                rowsRef.current[rowIndex] = el;
              }}
              className="rally-track flex gap-4 md:gap-6 will-change-transform"
            >
              {rowItems[rowIndex]?.map((item, itemIdx) => (
                <button
                  type="button"
                  key={`${item.id}-${rowIndex}-${itemIdx}`}
                  className="rally-card group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-ink/10 transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl hover:z-20 text-left"
                  style={{
                    width: `${config.cardWidth}px`,
                    height: `${config.cardHeight}px`,
                  }}
                  onClick={() => onSelectItem(item)}
                  data-cursor="VIEW REEL"
                  aria-label={`Rally stream reel: ${item.title}`}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />

                  {/* Gradient shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Play badge */}
                  <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-accent">
                    <PlayIcon size={14} />
                  </div>

                  {/* Metadata */}
                  <div className="absolute bottom-0 inset-x-0 p-3 md:p-4 text-white">
                    <span className="text-[10px] md:text-[11px] font-semibold tracking-wider text-accent-soft uppercase">
                      {item.category}
                    </span>
                    <h4 className="text-xs md:text-sm font-medium tracking-tight text-white line-clamp-1 mt-0.5">
                      {item.title}
                    </h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
