import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service, production policies, and booking conditions for Pocket Reels 360.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <article className="legal-page page-shell max-w-4xl mx-auto py-16 sm:py-24 text-ink">
      <header className="mb-12 border-b border-line pb-8">
        <p className="eyebrow text-accent font-semibold tracking-wider text-xs uppercase mb-2">
          Customer Agreement & Policies
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-3">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Effective & Last Updated: September 16, 2026 · Governing Video Production & Creative Deliverables
        </p>
      </header>

      <div className="legal-page__body flex flex-col gap-10 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink mb-3">1. Agreement to Terms</h2>
          <p>
            By accessing or using the Pocket Reels 360 website, interacting with our digital channels, or requesting video production services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">2. Booking Inquiries & Scoping</h2>
          <p className="mb-3">
            Submitting an appointment form via this website represents a production inquiry and slot reservation request. Selected dates and times remain tentative until:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>Our production team reviews your event schedule, location, and creative scope.</li>
            <li>We confirm crew availability and provide a transparent, written quote tailored to your shoot.</li>
            <li>Both parties execute the formal production agreement or written confirmation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">3. Transparent Pricing & No Hidden Fees</h2>
          <p>
            We pride ourselves on transparent, honest pricing with zero hidden fees. All package inclusions, hourly shooting allocations, delivery timelines, and revision rounds will be clearly detailed in your project estimate prior to any financial commitment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">4. Intellectual Property & Portfolio Usage</h2>
          <p className="mb-3">
            <strong>Client Rights:</strong> Upon receipt of full payment for completed services, clients receive a perpetual, non-exclusive license to use, display, publish, and distribute the delivered video reels across digital and social platforms.
          </p>
          <p>
            <strong>Portfolio Showcase:</strong> Unless explicitly agreed in writing under a non-disclosure agreement (NDA), Pocket Reels 360 reserves the right to display excerpts of produced reels on our website and social channels for portfolio and marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">5. Rescheduling, Cancellations & Weather</h2>
          <p className="mb-3">
            We understand that live events and outdoor productions can shift:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li><strong>Rescheduling:</strong> Clients may request to reschedule a confirmed shoot with at least 48 hours notice, subject to crew calendar availability.</li>
            <li><strong>Inclement Weather:</strong> For outdoor shoots affected by severe weather or safety risks, dates may be rescheduled without penalty to the next mutually agreeable date.</li>
            <li><strong>Refunds:</strong> Detailed policies governing deposits, retainers, and cancellations are set forth in our <Link href="/refund" className="text-accent underline">Refund Policy</Link>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">6. User Conduct & Accuracy of Information</h2>
          <p>
            You agree to provide accurate, truthful, and complete details when submitting booking inquiries. You also agree not to submit fraudulent bookings, spam, malicious code, or content that infringes upon the intellectual property or privacy of others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable US law, Pocket Reels 360 and its videographers, editors, and contractors shall not be liable for indirect, incidental, punitive, or consequential damages arising from unforeseen venue restrictions, schedule overruns caused by third parties, or equipment failures outside reasonable control. In all cases, our maximum aggregate liability is limited to the total fees paid by the client for the specific service in dispute.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">8. Governing Law & Dispute Resolution</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law principles. Any dispute arising under these terms shall be resolved in the state or federal courts located in Dallas County, Texas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">9. Contact & Inquiries</h2>
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
          <Link className="button button--light" href="/refund">
            View Refund Policy →
          </Link>
        </div>
      </div>
    </article>
  );
}
