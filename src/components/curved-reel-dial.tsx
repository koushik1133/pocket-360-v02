"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, PlayIcon } from "@/components/icons";
import { workItems } from "@/content/site";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CurvedReelDial() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0.5);
  const [activeItem, setActiveItem] = useState<(typeof workItems)[number] | null>(null);

  // We use 8 distinct vertical work items for the cylindrical arc
  const items = workItems.slice(0, 8);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Pin and scrub horizontal movement as user scrolls down
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "+=200%",
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        },
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // Calculate position, scale, and 3D rotation for each card based on scrollProgress
  const cardCount = items.length;

  return (
    <section
      ref={containerRef}
      className="curved-dial-section relative min-h-screen bg-ink text-white overflow-hidden flex flex-col justify-center py-16 z-20 isolate"
      style={{ backgroundColor: "#141312" }}
      aria-label="3D Curved Reel Dial"
    >
      {/* Background ambient spotlight */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/15 blur-[140px] rounded-full" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#141312] to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141312] to-transparent z-10" />
      </div>

      {/* Header */}
      <div className="page-shell relative z-20 text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-mono uppercase tracking-widest text-accent-soft mb-3">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          IMMERSIVE REEL CYLINDER
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white">
          Scroll through <em className="font-serif text-accent italic font-normal">the reels.</em>
        </h2>
        <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto mt-2">
          Vertical 4K stories captured on iPhone. Center reels expand in full clarity as you explore.
        </p>
      </div>

      {/* 3D Cylindrical Curved Viewport */}
      <div
        className="relative w-full h-[420px] sm:h-[520px] md:h-[580px] overflow-hidden flex items-center justify-center z-10"
        style={{ perspective: "1300px" }}
      >
        <div
          ref={trackRef}
          className="relative w-full max-w-7xl h-full flex items-center justify-center pointer-events-auto"
          style={{ transformStyle: "preserve-3d" }}
        >
          {items.map((item, index) => {
            // Normalized offset from current active scroll position (-3.5 to +3.5)
            const centerIndex = scrollProgress * (cardCount - 1);
            const offset = index - centerIndex;
            const absOffset = Math.abs(offset);

            // 3D Cylinder geometry calculations
            const xOffsetPx = offset * 280; // horizontal spacing
            const zOffsetPx = -Math.pow(absOffset, 1.35) * 85; // curve back into depth
            const rotateYDeg = Math.max(-42, Math.min(42, -offset * 16)); // curve rotation
            const scale = Math.max(0.72, 1.14 - absOffset * 0.16); // center is big, sides become short
            const opacity = Math.max(0.35, 1 - absOffset * 0.22);
            const zIndex = Math.round(50 - absOffset * 10);
            const isCenter = absOffset < 0.6;

            return (
              <div
                key={item.id}
                className="absolute transition-transform duration-100 ease-out will-change-transform cursor-pointer"
                style={{
                  transform: `translateX(${xOffsetPx}px) translateZ(${zOffsetPx}px) rotateY(${rotateYDeg}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                }}
                onClick={() => setActiveItem(item)}
              >
                {/* Vertical Reel Card (9:16 aspect ratio) */}
                <div
                  className={`group relative w-[200px] sm:w-[240px] md:w-[270px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                    isCenter
                      ? "ring-2 ring-accent/80 shadow-accent/25 shadow-2xl"
                      : "ring-1 ring-white/15"
                  } bg-ink`}
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 240px, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient shade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30 pointer-events-none" />

                  {/* Top Camera HUD */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-white/90 z-10">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      REC
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-white/70">
                      4K 60
                    </span>
                  </div>

                  {/* Center Play button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-accent/90 backdrop-blur-md flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <PlayIcon size={20} />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent block mb-0.5">
                      {item.category}
                    </span>
                    <strong className="text-sm sm:text-base font-semibold text-white block leading-tight truncate">
                      {item.title}
                    </strong>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/15 text-[10px] text-white/70">
                      <span>Shot on iPhone</span>
                      <span className="inline-flex items-center gap-0.5 text-accent-soft group-hover:text-white font-medium">
                        Watch <ArrowUpRightIcon size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Dial Navigation Controls */}
      <div className="page-shell relative z-20 flex items-center justify-center gap-4 mt-6">
        <button
          type="button"
          aria-label="Previous reel"
          onClick={() => setScrollProgress((p) => Math.max(0, p - 0.15))}
          className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
        >
          <ArrowLeftIcon size={16} />
        </button>

        {/* Progress scrub bar */}
        <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-accent transition-all duration-150 rounded-full"
            style={{ width: `${Math.round(scrollProgress * 100)}%` }}
          />
        </div>

        <button
          type="button"
          aria-label="Next reel"
          onClick={() => setScrollProgress((p) => Math.min(1, p + 0.15))}
          className="w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-colors"
        >
          <ArrowRightIcon size={16} />
        </button>
      </div>

      {/* Lightbox / Direct Reel Viewer modal if clicked */}
      {activeItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="relative max-w-sm w-full bg-ink border border-white/20 rounded-3xl overflow-hidden p-6 shadow-2xl flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden mb-4">
              <Image
                src={activeItem.image}
                alt={activeItem.alt}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-xs uppercase font-bold text-accent tracking-wider">
                  {activeItem.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {activeItem.title}
                </h3>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              {activeItem.instagramUrl ? (
                <a
                  href={activeItem.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button button--light flex-1 justify-center"
                >
                  Open on Instagram
                  <ArrowUpRightIcon size={16} />
                </a>
              ) : null}
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setActiveItem(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
