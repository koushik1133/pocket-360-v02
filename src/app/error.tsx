"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="status-page page-shell">
      <p className="eyebrow">Something went wrong</p>
      <h1>Let&apos;s try that again.</h1>
      <p>The page could not be completed just now.</p>
      <button type="button" className="button button--dark" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
