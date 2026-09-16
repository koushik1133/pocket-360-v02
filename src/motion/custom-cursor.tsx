"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const [label, setLabel] = useState<string>("");
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop with a fine pointer; touch has no hover.
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || prefersReduced) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const show = (visible: boolean) => {
      if (visibleRef.current === visible) return;
      visibleRef.current = visible;
      setIsVisible(visible);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      show(true);
    };

    const onMouseLeave = () => show(false);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    const updateCursor = () => {
      pos.x += (mouse.x - pos.x) * 0.18;
      pos.y += (mouse.y - pos.y) * 0.18;
      gsap.set(cursor, { x: pos.x, y: pos.y });
    };
    gsap.ticker.add(updateCursor);

    // Event delegation for [data-cursor] hover labels.
    let activeTarget: Element | null = null;
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-cursor]") ?? null;
      if (target === activeTarget) return;
      activeTarget = target;
      if (target) {
        setLabel(target.getAttribute("data-cursor") || "VIEW");
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
  }, []);

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
