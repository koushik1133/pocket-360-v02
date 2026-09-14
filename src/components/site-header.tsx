"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navigation } from "@/content/site";
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from "@/components/icons";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={`site-header ${compact ? "site-header--compact" : ""}`}
        data-open={menuOpen ? "true" : "false"}
      >
        <div className="site-header__inner">
          <Logo />

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <Link className="button button--dark header-book" href="/book">
              Book an appointment
              <ArrowUpRightIcon size={16} />
            </Link>
            <button
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon size={25} /> : <MenuIcon size={25} />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-navigation"
        className={`mobile-menu ${menuOpen ? "mobile-menu--open" : ""}`}
        aria-hidden={!menuOpen}
        inert={menuOpen ? undefined : true}
      >
        <nav className="mobile-menu__links" aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <Link key={item.label} href={item.href} onClick={closeMenu}>
              <span>0{index + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-menu__foot">
          <p>Dallas · NYC · Chicago · Charlotte</p>
          <Link className="button button--light" href="/book" onClick={closeMenu}>
            Book an appointment
            <ArrowUpRightIcon size={18} />
          </Link>
        </div>
      </div>
    </>
  );
}
