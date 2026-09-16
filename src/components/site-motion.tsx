"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-ready");

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // ─── Reveal observer (data-reveal) ───────────────────────────────────────
    const observedReveals = new WeakSet<Element>();

    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "250px 0px 250px 0px", threshold: 0.001 },
    );

    const observeAllReveals = () => {
      const elements = document.querySelectorAll<HTMLElement>("[data-reveal]");
      elements.forEach((el) => {
        if (prefersReduced) {
          el.classList.add("is-visible");
        } else if (!observedReveals.has(el) && !el.classList.contains("is-visible")) {
          observedReveals.add(el);
          revealObserver.observe(el);
        }
      });
    };

    observeAllReveals();

    // ─── Stagger observer (data-stagger) ─────────────────────────────────────
    const observedStaggers = new WeakSet<Element>();

    const staggerObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            staggerObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "250px 0px 250px 0px", threshold: 0.001 },
    );

    const observeAllStaggers = () => {
      const elements = document.querySelectorAll<HTMLElement>("[data-stagger]");
      elements.forEach((el) => {
        if (prefersReduced) {
          el.classList.add("is-visible");
        } else if (!observedStaggers.has(el) && !el.classList.contains("is-visible")) {
          observedStaggers.add(el);
          staggerObserver.observe(el);
        }
      });
    };

    observeAllStaggers();

    return () => {
      revealObserver.disconnect();
      staggerObserver.disconnect();
    };
  }, [pathname]);

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

  // ─── Multi-speed Parallax on data-parallax-speed elements ────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // Only run on desktop devices to avoid CPU throttling on mobile
    const isDesktop = window.matchMedia("(min-width: 900px)").matches;
    if (!isDesktop) return;

    const parallaxItems = document.querySelectorAll<HTMLElement>("[data-parallax-speed]");
    if (parallaxItems.length === 0) return;

    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      parallaxItems.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh + 100 && rect.bottom > -100) {
          const speed = parseFloat(el.getAttribute("data-parallax-speed") || "0.1");
          const offset = (scrollY - (rect.top + scrollY - vh / 2)) * speed * 0.15;
          el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        }
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
      parallaxItems.forEach((el) => {
        el.style.transform = "";
      });
    };
  }, []);

  return null;
}
