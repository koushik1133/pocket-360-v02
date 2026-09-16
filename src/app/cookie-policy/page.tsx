import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Information about cookies, local storage, and tracking technologies used by Pocket Reels 360.",
  robots: { index: true, follow: true },
};

export default function CookiePolicyPage() {
  return (
    <article className="legal-page page-shell max-w-4xl mx-auto py-16 sm:py-24 text-ink">
      <header className="mb-12 border-b border-line pb-8">
        <p className="eyebrow text-accent font-semibold tracking-wider text-xs uppercase mb-2">
          Tracking &amp; Privacy Notice
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-3">
          Cookie Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Effective & Last Updated: September 16, 2026 · Privacy-First Principles
        </p>
      </header>

      <div className="legal-page__body flex flex-col gap-10 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink mb-3">1. What Are Cookies &amp; Local Storage?</h2>
          <p>
            Cookies and browser local storage are small data files placed on your device by websites you visit. They allow a site to remember your preferences and ensure security features function smoothly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">2. How We Use Cookies &amp; Storage</h2>
          <p className="mb-3">
            Pocket Reels 360 adheres to a strict <strong>privacy-first approach</strong>:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-line rounded-xl overflow-hidden">
              <thead className="bg-paper border-b border-line">
                <tr>
                  <th className="p-3 text-ink font-bold">Category</th>
                  <th className="p-3 text-ink font-bold">Purpose</th>
                  <th className="p-3 text-ink font-bold">Type / Expiration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="p-3 font-semibold text-ink">Essential / Security</td>
                  <td className="p-3">Ensures rate limiting, spam prevention on booking forms, and admin session authentication.</td>
                  <td className="p-3">Session / Temporary</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink">Preferences</td>
                  <td className="p-3">Remembers your cookie consent choices and audio preferences so you aren&apos;t prompted repeatedly.</td>
                  <td className="p-3">Local Storage (1 year)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-ink">Advertising / Tracking</td>
                  <td className="p-3 font-bold text-accent">NONE. We do NOT use third-party advertising cookies, cross-site trackers, or data-broker pixels.</td>
                  <td className="p-3">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">3. Managing Your Choices</h2>
          <p>
            You can customize or delete cookies at any time through your web browser settings (Chrome, Safari, Firefox, Edge). Because our cookies are solely strictly necessary for secure booking and basic preferences, disabling all cookies will not degrade your browsing experience on our site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">4. Contact Information</h2>
          <div className="bg-paper/70 p-5 rounded-2xl border border-line">
            <p className="font-bold text-ink">Pocket Reels 360</p>
            <p className="text-xs text-muted">Hubs: {brand.locationLine}</p>
            <p className="text-xs text-muted mt-1">
              Instagram:{" "}
              <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="text-accent underline">
                {brand.handle}
              </a>
            </p>
          </div>
        </section>

        <div className="pt-8 border-t border-line flex items-center justify-between">
          <Link className="button button--ghost" href="/">
            ← Back to home
          </Link>
          <Link className="button button--light" href="/privacy">
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </article>
  );
}
