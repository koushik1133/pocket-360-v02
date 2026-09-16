"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Hook for scroll-triggered entrance animations with GSAP ScrollTrigger
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: {
  y?: number;
  opacity?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  ease?: string;
  triggerHook?: string;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    const {
      y = 35,
      opacity = 0,
      duration = 0.9,
      stagger = 0.08,
      delay = 0,
      ease = "power3.out",
      triggerHook = "top 85%",
    } = options || {};

    const children = el.querySelectorAll("[data-reveal-item]");
    const target = children.length > 0 ? children : el;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        target,
        { opacity, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: children.length > 0 ? stagger : 0,
          delay,
          ease,
          scrollTrigger: {
            trigger: el,
            start: triggerHook,
            once: true,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [options]);

  return ref;
}

/**
 * Hook for scroll-based parallax translation
 */
export function useParallax<T extends HTMLElement = HTMLElement>(
  speed: number = 0.2,
  direction: "vertical" | "horizontal" = "vertical",
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      const distance = speed * 100;
      if (direction === "vertical") {
        gsap.fromTo(
          el,
          { y: -distance },
          {
            y: distance,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      } else {
        gsap.fromTo(
          el,
          { x: -distance },
          {
            x: distance,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [speed, direction]);

  return ref;
}

/**
 * Hook for scroll-based zoom & scale reveal
 */
export function useScaleReveal<T extends HTMLElement = HTMLElement>(options?: {
  startScale?: number;
  endScale?: number;
  startOpacity?: number;
  scrub?: boolean | number;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const {
      startScale = 0.92,
      endScale = 1.0,
      startOpacity = 0.7,
      scrub = 1.2,
    } = options || {};

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { scale: startScale, opacity: startOpacity },
        {
          scale: endScale,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "center 50%",
            scrub,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [options]);

  return ref;
}
