"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRightIcon } from "@/components/icons";
import type { WorkItem } from "@/content/site";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type FeaturedSpotlightProps = {
  item: WorkItem;
};

export function FeaturedSpotlight({ item }: FeaturedSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    const imageWrap = imageWrapRef.current;
    if (!container || !card || !imageWrap) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Bidirectional center-peaked zoom:
      // - Starts zoomed out (scale: 0.80) when entering the viewport
      // - Fully zooms in (scale: 1.06) when centered in the viewport
      // - Zooms back out (scale: 0.80) when scrolling past the viewport
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.8,
        },
      });

      // ── Phase 1: Entry from bottom to center (0.0 -> 0.5) ──
      tl.fromTo(
        card,
        {
          scale: 0.82,
          borderRadius: "3rem",
          transformOrigin: "center center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        },
        {
          scale: 1.06,
          borderRadius: "1.25rem",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          ease: "power1.out",
          duration: 0.5,
        },
        0,
      );

      tl.fromTo(
        imageWrap,
        {
          scale: 1.25,
          transformOrigin: "center center",
        },
        {
          scale: 1.02,
          ease: "power1.out",
          duration: 0.5,
        },
        0,
      );

      // ── Phase 2: Center to exit past top (0.5 -> 1.0) ──
      tl.to(
        card,
        {
          scale: 0.82,
          borderRadius: "3rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          ease: "power1.in",
          duration: 0.5,
        },
        0.5,
      );

      tl.to(
        imageWrap,
        {
          scale: 1.25,
          ease: "power1.in",
          duration: 0.5,
        },
        0.5,
      );

      if (copyRef.current) {
        tl.fromTo(
          copyRef.current,
          {
            y: 30,
            opacity: 0.7,
          },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            duration: 0.5,
          },
          0,
        );

        tl.to(
          copyRef.current,
          {
            y: -20,
            opacity: 0.7,
            ease: "none",
            duration: 0.5,
          },
          0.5,
        );
      }
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="featured-spotlight-wrapper py-12 sm:py-20 overflow-visible"
    >
      <div className="page-shell">
        <div className="featured__label flex items-center justify-between mb-4">
          <p className="eyebrow text-accent font-semibold tracking-wider">
            FEATURED WORK
          </p>
          <p className="text-xs uppercase tracking-widest text-muted font-bold">
            {item.category}
          </p>
        </div>

        <a
          ref={cardRef}
          href={item.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="featured__media group relative block overflow-hidden shadow-2xl will-change-transform"
          style={{ willChange: "transform, border-radius, box-shadow" }}
          data-cursor="VIEW REEL"
        >
          {/* Inner zoomable image container */}
          <div
            ref={imageWrapRef}
            className="relative w-full h-full min-h-[380px] sm:min-h-[520px] md:min-h-[640px] will-change-transform"
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              priority
              sizes="(max-width: 1200px) 96vw, 1200px"
              className="object-cover"
            />
          </div>

          {/* Cinematic lighting gradient */}
          <span className="featured__wash bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

          {/* Camera Viewfinder / REC badge on top right */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white/90">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>ORIGINAL REEL</span>
          </div>

          {/* Headline and info */}
          <span ref={copyRef} className="featured__copy z-10">
            <small className="text-accent-soft uppercase tracking-widest text-xs font-bold block mb-1">
              IN THE ROOM
            </small>
            <strong className="text-3xl sm:text-5xl md:text-6xl text-white font-medium tracking-tight block">
              {item.title}
            </strong>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-white mt-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 transition-colors">
              View original reel
              <ArrowUpRightIcon size={16} />
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}
