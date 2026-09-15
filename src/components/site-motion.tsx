"use client";

import { useEffect } from "react";

export function SiteMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // ─── Reveal observer (data-reveal) ───────────────────────────────────────
    const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (prefersReduced) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
    } else {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
      );
      revealElements.forEach((el) => revealObserver.observe(el));
      return () => revealObserver.disconnect();
    }
  }, []);

  // ─── Stagger observer (data-stagger) + nav active state ───────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const staggerElements =
      document.querySelectorAll<HTMLElement>("[data-stagger]");

    if (prefersReduced) {
      staggerElements.forEach((el) => el.classList.add("is-visible"));
    } else {
      const staggerObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              staggerObserver.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
      );
      staggerElements.forEach((el) => staggerObserver.observe(el));
      return () => staggerObserver.disconnect();
    }
  }, []);

  // ─── Active nav section tracking ─────────────────────────────────────────
  useEffect(() => {
    const navLinks =
      document.querySelectorAll<HTMLAnchorElement>(".desktop-nav a");
    if (navLinks.length === 0) return;

    const sectionIds = Array.from(navLinks)
      .map((link) => {
        const href = link.getAttribute("href") ?? "";
        const match = href.match(/#(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean) as string[];

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    let activeId: string | null = null;

    const markActive = (id: string | null) => {
      if (id === activeId) return;
      activeId = id;
      navLinks.forEach((link) => {
        const href = link.getAttribute("href") ?? "";
        const isActive = id ? href.endsWith(`#${id}`) : false;
        link.dataset["active"] = String(isActive);
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        // Find the topmost intersecting section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0 && visible[0]) {
          markActive(visible[0].target.id);
        }
      },
      { rootMargin: "-10% 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((section) => sectionObserver.observe(section));
    return () => sectionObserver.disconnect();
  }, []);

  // ─── Hero panel subtle parallax on scroll ────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    const panels = document.querySelectorAll<HTMLElement>(".hero__panel img");
    if (panels.length === 0) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      if (scrollY > vh * 1.2) return; // only within hero range

      const progress = scrollY / vh;
      panels.forEach((panel, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        const offset = progress * 24 * direction;
        panel.style.transform = `translateY(${offset}px) scale(1)`;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      panels.forEach((panel) => {
        panel.style.transform = "";
      });
    };
  }, []);

  return null;
}
