import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/site";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Transparent refund and cancellation policies for Pocket Reels 360 bookings.",
  robots: { index: true, follow: true },
};

export default function RefundPage() {
  return (
    <article className="legal-page page-shell max-w-4xl mx-auto py-16 sm:py-24 text-ink">
      <header className="mb-12 border-b border-line pb-8">
        <p className="eyebrow text-accent font-semibold tracking-wider text-xs uppercase mb-2">
          Consumer Protection & Transparency
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-3">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Effective & Last Updated: September 16, 2026 · Zero Hidden Fees Commitment
        </p>
      </header>

      <div className="legal-page__body flex flex-col gap-10 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink mb-3">1. Free Inquiries & Zero Obligation</h2>
          <p>
            Submitting a booking inquiry through our website is completely free and entails zero financial obligation. No credit card or payment information is collected on our website. You will receive a transparent, itemized quote to review before choosing to proceed.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">2. Booking Retainer & Reservation</h2>
          <p className="mb-3">
            Once a shoot is confirmed and scheduled, a retainer deposit may be required to lock the videographer&apos;s date and block off our production calendar.
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li><strong>Advance Cancellation (&gt; 7 days):</strong> If you cancel your booking more than 7 days before the scheduled shoot date, your deposit is fully refundable, minus any direct non-recoverable travel costs incurred.</li>
            <li><strong>Short-Notice Cancellation (&le; 7 days):</strong> Because our crew turns away other clients for your reserved time, cancellations within 7 days may forfeit the deposit, but can be applied 100% as a credit toward any rescheduled date within 6 months.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">3. Rescheduling & Weather Contingencies</h2>
          <p>
            We accommodate rescheduling requests with at least 48 hours notice at no additional penalty. For outdoor shoots impacted by extreme weather or hazardous conditions, shoots can be rescheduled freely without fee.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">4. Quality Assurance & Revisions</h2>
          <p>
            We stand behind our production quality. Every video reel package includes a designated round of creative revisions (audio mixing, pacing, color balance, text overlays). If a technical delivery defect occurs on our end, we will promptly re-edit or re-export your project at no extra cost.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">5. Contact Regarding Cancellations</h2>
          <p className="mb-3">
            To request a cancellation, reschedule, or refund review, please contact our team directly:
          </p>
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
          <Link className="button button--light" href="/cookie-policy">
            View Cookie Policy →
          </Link>
        </div>
      </div>
    </article>
  );
}
