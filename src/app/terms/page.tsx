import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Appointment request terms for Pocket Reels 360.",
};

export default function TermsPage() {
  return (
    <article className="legal-page page-shell">
      <header>
        <p className="eyebrow">Terms</p>
        <h1>Appointment requests.</h1>
        <p>Last updated September 14, 2026</p>
      </header>

      <div className="legal-page__body">
        <section>
          <h2>Requests and confirmation</h2>
          <p>
            Submitting the form sends an appointment request. The selected date
            and time remain preferences until Pocket Reels 360 contacts you and
            confirms the details.
          </p>
        </section>
        <section>
          <h2>Accurate information</h2>
          <p>
            Provide current contact information and project details so the crew
            can respond to the request.
          </p>
        </section>
        <section>
          <h2>Portfolio media</h2>
          <p>
            Portfolio and reel previews on this site represent publicly visible
            Pocket Reels 360 Instagram content. Original posts remain available
            through the linked Instagram pages.
          </p>
        </section>
        <section>
          <h2>Contact</h2>
          <p>
            Questions about an appointment can be sent to the public Pocket
            Reels 360 Instagram account.
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
