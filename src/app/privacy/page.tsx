import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Pocket Reels 360 handles appointment information.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <article className="legal-page page-shell">
      <header>
        <p className="eyebrow">Privacy</p>
        <h1>Your appointment information.</h1>
        <p>Last updated September 14, 2026</p>
      </header>

      <div className="legal-page__body">
        <section>
          <h2>What the booking form collects</h2>
          <p>
            The appointment form collects the service, preferred date and time,
            name, phone number, email address, and any project details you
            choose to provide.
          </p>
        </section>
        <section>
          <h2>How the information is used</h2>
          <p>
            Booking information is used to review the request, contact you, and
            coordinate the appointment. It is also used to prevent two active
            requests from reserving the same time.
          </p>
        </section>
        <section>
          <h2>Email delivery</h2>
          <p>
            When email delivery is configured, the website sends a request
            confirmation to the customer and a notification to Pocket Reels
            360 through the configured email provider.
          </p>
        </section>
        <section>
          <h2>Security and spam prevention</h2>
          <p>
            The form validates information on the server, limits repeated
            submissions, and includes a hidden spam check. Secrets and email
            provider credentials stay on the server.
          </p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            For privacy questions, contact Pocket Reels 360 through the
            business&apos;s public Instagram account.
          </p>
          <a
            className="text-link"
            href="https://www.instagram.com/pocketreels360/"
            target="_blank"
            rel="noreferrer"
          >
            @pocketreels360
          </a>
        </section>
        <Link className="button button--ghost" href="/">
          Back to home
        </Link>
      </div>
    </article>
  );
}
