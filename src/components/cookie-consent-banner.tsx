"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "pr360_cookie_consent_v1";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing =
      typeof window !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : "accepted";
    if (!existing) {
      // Delay display slightly to avoid shifting initial layout
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "essential_only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Choices"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#141211]/95 border border-white/15 backdrop-blur-xl text-white p-5 rounded-2xl shadow-2xl animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-accent text-sm font-bold">●</span>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Your Privacy &amp; Cookies
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDecline}
          aria-label="Close cookie banner"
          className="text-white/50 hover:text-white text-xs p-1"
        >
          ✕
        </button>
      </div>

      <p className="text-xs text-white/70 leading-relaxed mb-4">
        We respect your privacy. Pocket Reels 360 uses strictly necessary cookies and local storage to secure booking requests and remember preferences. We never sell your personal data or use third-party tracking pixels.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
        <div className="flex items-center gap-3 text-[11px] text-white/50">
          <Link href="/privacy" className="hover:text-white underline underline-offset-2">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link href="/cookie-policy" className="hover:text-white underline underline-offset-2">
            Cookie Policy
          </Link>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleDecline}
            className="px-3 py-1.5 rounded-lg text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
