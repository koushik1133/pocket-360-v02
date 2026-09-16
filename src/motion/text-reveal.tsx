"use client";

import { useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type TextRevealProps = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  highlightWords?: string[];
  highlightClass?: string;
};

export function TextReveal({
  text,
  as: Component = "h2",
  className = "",
  delay = 0,
  stagger = 0.03,
  duration = 0.6,
  once = true,
  highlightWords = [],
  highlightClass = "text-accent font-serif italic",
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const words = el.querySelectorAll(".text-reveal-word");
    if (words.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration,
          stagger,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [delay, stagger, duration, once]);

  const words = text.split(" ");

  return (
    <Component
      ref={containerRef}
      className={`text-reveal-container leading-tight ${className}`}
      aria-label={text}
    >
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className="text-reveal-inner inline-flex flex-wrap gap-x-[0.3em] gap-y-[0.15em] overflow-visible py-1"
      >
        {words.map((word, i) => {
          const isHighlight = highlightWords.some(
            (hw) => word.toLowerCase().includes(hw.toLowerCase()),
          );
          return (
            <span
              key={`${word}-${i}`}
              className="inline-block overflow-visible"
            >
              <span
                className={`text-reveal-word inline-block will-change-transform ${
                  isHighlight ? highlightClass : ""
                }`}
              >
                {word}
              </span>
            </span>
          );
        })}
      </span>
    </Component>
  );
}

