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
  cardWidthDesktop: number;
  cardHeightDesktop: number;
  cardWidthMobile: number;
  cardHeightMobile: number;
  opacity: number;
  scale: number;
  zIndex: number;
  mobileVisible: boolean;
};

const rowConfigs: RowConfig[] = [
  {
    id: 1,
    baseSpeed: 0.22,
    direction: 1,
    cardWidthDesktop: 190,
    cardHeightDesktop: 255,
    cardWidthMobile: 140,
    cardHeightMobile: 195,
    opacity: 0.75,
    scale: 0.92,
    zIndex: 1,
    mobileVisible: false,
  },
  {
    id: 2,
    baseSpeed: 0.45,
    direction: -1,
    cardWidthDesktop: 230,
    cardHeightDesktop: 310,
    cardWidthMobile: 148,
    cardHeightMobile: 205,
    opacity: 0.9,
    scale: 0.96,
    zIndex: 2,
    mobileVisible: true,
  },
  {
    id: 3,
    baseSpeed: 0.85,
    direction: 1,
    cardWidthDesktop: 280,
    cardHeightDesktop: 380,
    cardWidthMobile: 165,
    cardHeightMobile: 228,
    opacity: 1.0,
    scale: 1.0,
    zIndex: 5,
    mobileVisible: true,
  },
  {
    id: 4,
    baseSpeed: 0.52,
    direction: -1,
    cardWidthDesktop: 230,
    cardHeightDesktop: 310,
    cardWidthMobile: 148,
    cardHeightMobile: 205,
    opacity: 0.9,
    scale: 0.96,
    zIndex: 2,
    mobileVisible: true,
  },
  {
    id: 5,
    baseSpeed: 0.26,
    direction: 1,
    cardWidthDesktop: 190,
    cardHeightDesktop: 255,
    cardWidthMobile: 140,
    cardHeightMobile: 195,
    opacity: 0.75,
    scale: 0.92,
    zIndex: 1,
    mobileVisible: false,
  },
];

export function RallyGallery({ items, onSelectItem }: RallyGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const offsetsRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const scrollVelocityRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const hoveredRowRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Distribute items across the rows with staggered offsets for natural variation
  const rowItems = useMemo(() => {
    if (!items.length) return [];
    return rowConfigs.map((_, rowIndex) => {
      const len = items.length;
      const shift = (rowIndex * 2) % len;
      const rotated = [...items.slice(shift), ...items.slice(0, shift)];
      let stream = [...rotated];
      while (stream.length < 5) {
        stream = [...stream, ...rotated];
      }
      return [...stream, ...stream];
    });
  }, [items]);

  // Pause the RAF loop while the wall is off-screen
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? true),
      { rootMargin: "200px 0px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced || !visible) return;

    lastScrollYRef.current = window.scrollY;
    scrollVelocityRef.current = 0;

    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
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

      scrollVelocityRef.current *= 0.92;

      rowConfigs.forEach((config, index) => {
        const rowEl = rowsRef.current[index];
        if (!rowEl) return;

        const speed =
          config.baseSpeed * config.direction +
          scrollVelocityRef.current * (config.direction * 0.5 + 0.5);

        const hoverMultiplier = hoveredRowRef.current === index ? 0.25 : 1.0;

        offsetsRef.current[index] =
          (offsetsRef.current[index] || 0) + speed * hoverMultiplier;

        const totalWidth = rowEl.scrollWidth / 2;
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
  }, [visible]);

  return (
    <div
      ref={containerRef}
      className="rally-stream relative w-full overflow-hidden py-4 sm:py-8 md:py-10 select-none"
      aria-label="Pocket Reels 360 Rally Wall"
    >
      {/* Ambient gradient vignettes on edges */}
      <div className="rally-vignette rally-vignette--left pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 sm:w-28 md:w-48 bg-gradient-to-r from-[var(--color-ivory)] to-transparent" />
      <div className="rally-vignette rally-vignette--right pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 sm:w-28 md:w-48 bg-gradient-to-l from-[var(--color-ivory)] to-transparent" />

      <div className="rally-rows flex flex-col gap-3 sm:gap-4 md:gap-6">
        {rowConfigs.map((config, rowIndex) => {
          if (isMobile && !config.mobileVisible) {
            return null;
          }

          const cardWidth = isMobile
            ? config.cardWidthMobile
            : config.cardWidthDesktop;
          const cardHeight = isMobile
            ? config.cardHeightMobile
            : config.cardHeightDesktop;

          return (
            <div
              key={config.id}
              className={`rally-row rally-row--${config.id} relative flex overflow-visible`}
              style={{
                zIndex: config.zIndex,
                opacity: config.opacity,
              }}
              onMouseEnter={() => {
                hoveredRowRef.current = rowIndex;
              }}
              onMouseLeave={() => {
                hoveredRowRef.current = null;
              }}
              onTouchStart={() => {
                hoveredRowRef.current = rowIndex;
              }}
              onTouchEnd={() => {
                hoveredRowRef.current = null;
              }}
            >
              <div
                ref={(el) => {
                  rowsRef.current[rowIndex] = el;
                }}
                className="rally-track flex gap-3 sm:gap-4 md:gap-6 will-change-transform"
              >
                {rowItems[rowIndex]?.map((item, itemIdx) => (
                  <button
                    type="button"
                    key={`${item.id}-${rowIndex}-${itemIdx}`}
                    className="rally-card group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-ink/10 transition-all duration-300 hover:scale-[1.04] active:scale-95 hover:shadow-2xl hover:z-20 text-left"
                    style={{
                      width: `${cardWidth}px`,
                      height: `${cardHeight}px`,
                    }}
                    onClick={() => onSelectItem(item)}
                    data-cursor="VIEW REEL"
                    aria-label={`Rally stream reel: ${item.title}`}
                  >
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 45vw, 25vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Gradient shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-65 group-hover:opacity-90 transition-opacity duration-300" />

                    {/* Play badge */}
                    <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-accent">
                      <PlayIcon size={13} />
                    </div>

                    {/* Metadata */}
                    <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-3 md:p-4 text-white">
                      <span className="text-[9px] sm:text-[10px] md:text-[11px] font-semibold tracking-wider text-accent-soft uppercase block">
                        {item.category}
                      </span>
                      <p className="text-[11px] sm:text-xs md:text-sm font-medium tracking-tight text-white line-clamp-1 mt-0.5">
                        {item.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
