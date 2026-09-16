import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/site";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy, data collection, and rights notice for Pocket Reels 360.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="legal-page page-shell max-w-4xl mx-auto py-16 sm:py-24 text-ink">
      <header className="mb-12 border-b border-line pb-8">
        <p className="eyebrow text-accent font-semibold tracking-wider text-xs uppercase mb-2">
          Legal & Data Protection
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink mb-3">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Effective & Last Updated: September 16, 2026 · Complies with US Federal, FTC, and State Privacy Regulations (including CCPA / CPRA)
        </p>
      </header>

      <div className="legal-page__body flex flex-col gap-10 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="text-xl font-bold text-ink mb-3">1. Overview & Scope</h2>
          <p>
            Pocket Reels 360 (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard personal information collected through our website, appointment scheduling forms, customer communications, and related services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">2. Information We Collect</h2>
          <p className="mb-3">
            We strictly collect only the information necessary to evaluate, scope, coordinate, and fulfill video production and reel creation bookings. This includes:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li><strong>Contact Information:</strong> Full name, email address, and telephone/mobile number.</li>
            <li><strong>Event & Production Details:</strong> Event dates, desired call time, venue location, city, state, country, and creative notes or package selections.</li>
            <li><strong>Technical & Log Data:</strong> Anonymized server logs, browser type, and timestamps used solely for security and rate-limiting to prevent malicious spam or DDoS attacks.</li>
            <li><strong>Communications:</strong> Content of inquiries submitted through our contact forms, AI assistant widget, or official email channels.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">3. How We Use Your Information</h2>
          <p className="mb-3">We use your information exclusively for legitimate business purposes:</p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li>Responding to your booking inquiry with transparent custom pricing quotes and crew availability.</li>
            <li>Scheduling and coordinating your on-site shoot and creative post-production.</li>
            <li>Sending booking confirmation notices and administrative updates via email.</li>
            <li>Protecting our site from automated fraud, double-booking, and abuse.</li>
          </ul>
          <p className="mt-3 font-semibold text-ink">
            We never sell, rent, monetize, or trade your personal data to third-party data brokers or advertisers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">4. Third-Party Service Providers</h2>
          <p className="mb-3">
            We only share data with vetted third-party service providers essential to operating our platform, governed by strict confidentiality terms:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li><strong>Resend:</strong> Secure transactional email delivery for booking confirmations and crew alerts.</li>
            <li><strong>Groq / AI Service:</strong> Powers our interactive creative assistant. Messages sent in the assistant are processed strictly for answering your inquiry and are not used for public model training.</li>
            <li><strong>Hosting & Infrastructure (Vercel):</strong> Fast, secure serverless hosting with automated DDoS protection and SSL encryption.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">5. Children&apos;s Online Privacy (COPPA)</h2>
          <p>
            Our website and booking services are directed solely to adults aged 18 and older. We do not knowingly collect personal information from children under the age of 13. If we become aware that personal data from a child under 13 has been submitted without verified parental consent, we will promptly delete that information from our records.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">6. State Privacy Rights (California CCPA/CPRA, Virginia, Colorado)</h2>
          <p className="mb-3">
            If you are a resident of California or another state with applicable privacy laws, you possess specific statutory rights regarding your personal data:
          </p>
          <ul className="list-disc pl-6 flex flex-col gap-2">
            <li><strong>Right to Know & Access:</strong> You can request a summary of personal information we have collected about you.</li>
            <li><strong>Right to Delete:</strong> You can request the deletion of your personal contact details from our records, subject to standard legal and transactional exceptions.</li>
            <li><strong>Right to Non-Discrimination:</strong> We will never discriminate against you, change pricing, or provide inferior service for exercising your privacy rights.</li>
            <li><strong>&quot;Do Not Sell or Share My Information&quot;:</strong> Because we do not sell or share personal data with third parties for cross-context behavioral advertising, no opt-out is necessary.</li>
          </ul>
          <p className="mt-3">
            To submit a privacy rights request,{" "}
            {env.NEXT_PUBLIC_CONTACT_EMAIL ? (
              <>
                email us at{" "}
                <a href={`mailto:${env.NEXT_PUBLIC_CONTACT_EMAIL}`} className="text-accent underline">
                  {env.NEXT_PUBLIC_CONTACT_EMAIL}
                </a>{" "}
                or{" "}
              </>
            ) : null}
            message us on our official Instagram channel{" "}
            <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="text-accent underline">
              {brand.handle}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">7. Data Security & Retention</h2>
          <p>
            We implement industry-standard administrative, physical, and technical safeguards (including HTTPS encryption, TLS transport, server-side data sanitization, and strict access controls) to protect your personal information. We retain inquiry and booking records only for as long as necessary to fulfill project commitments and satisfy tax and legal compliance obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-ink mb-3">8. Contact Us</h2>
          <p className="mb-3">
            If you have questions, feedback, or requests regarding this Privacy Policy or your personal information, please contact us:
          </p>
          <div className="bg-paper/70 p-5 rounded-2xl border border-line">
            <p className="font-bold text-ink">Pocket Reels 360</p>
            <p className="text-xs text-muted">Production Hubs: {brand.locationLine}</p>
            <p className="text-xs text-muted mt-1">
              Official Instagram:{" "}
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
          <Link className="button button--light" href="/terms">
            View Terms of Service →
          </Link>
        </div>
      </div>
    </article>
  );
}
