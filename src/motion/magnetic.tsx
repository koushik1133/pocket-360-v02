"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

type MagneticProps = {
  children: ReactNode;
  strength?: number;
  className?: string;
  disabled?: boolean;
};

export function Magnetic({
  children,
  strength = 0.35,
  className = "",
  disabled = false,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || disabled) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // Check if device supports fine hover (desktop mouse)
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    let bounds: DOMRect;

    const onMouseEnter = () => {
      bounds = el.getBoundingClientRect();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      // Limit maximum translation to ~12px
      const clampedX = Math.max(-12, Math.min(12, deltaX));
      const clampedY = Math.max(-12, Math.min(12, deltaY));

      gsap.to(el, {
        x: clampedX,
        y: clampedY,
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1.1, 0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);

    return () => {
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      gsap.killTweensOf(el);
    };
  }, [strength, disabled]);

  return (
    <div
      ref={ref}
      className={`magnetic-wrapper inline-block ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
    </div>
  );
}
