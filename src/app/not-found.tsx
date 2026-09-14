import Link from "next/link";

export default function NotFound() {
  return (
    <section className="status-page page-shell">
      <p className="eyebrow">404</p>
      <h1>This frame is out of view.</h1>
      <p>The page you requested could not be found.</p>
      <Link className="button button--dark" href="/">
        Back to home
      </Link>
    </section>
  );
}
