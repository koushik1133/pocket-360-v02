"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string>("");
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop with fine mouse pointer
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canHover || prefersReduced) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    // Quick lerp loop with gsap ticker
    const updateCursor = () => {
      pos.x += (mouse.x - pos.x) * 0.18;
      pos.y += (mouse.y - pos.y) * 0.18;
      if (cursor) {
        gsap.set(cursor, {
          x: pos.x,
          y: pos.y,
        });
      }
    };

    gsap.ticker.add(updateCursor);

    // Observer / delegate for [data-cursor]
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-cursor]");
      if (target) {
        const cursorText = target.getAttribute("data-cursor") || "VIEW";
        setLabel(cursorText);
        setIsActive(true);
      } else {
        setLabel("");
        setIsActive(false);
      }
    };

    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
      gsap.ticker.remove(updateCursor);
    };
  }, [isVisible]);

  return (
    <div
      ref={cursorRef}
      className={`media-cursor pointer-events-none fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      } ${isActive ? "media-cursor--active" : "media-cursor--dot"}`}
      aria-hidden="true"
    >
      <div className="media-cursor__badge flex items-center justify-center">
        {isActive && label ? (
          <span className="media-cursor__label uppercase tracking-widest text-[11px] font-semibold">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
