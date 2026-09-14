import Link from "next/link";
import { brand, navigation } from "@/content/site";
import { ArrowUpRightIcon, InstagramIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { emailUrl, whatsappUrl } from "@/lib/contact-links";

type SiteFooterProps = {
  whatsappNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
};

export function SiteFooter({
  whatsappNumber,
  contactEmail,
  contactPhone,
}: SiteFooterProps) {
  const whatsapp = whatsappUrl(whatsappNumber);
  const email = emailUrl(contactEmail, "Pocket Reels 360 project inquiry");

  return (
    <footer className="site-footer">
      <div className="page-shell site-footer__top">
        <div className="site-footer__intro" data-reveal>
          <p className="eyebrow eyebrow--light">Your spotlight, in motion</p>
          <h2>Let&apos;s create something worth replaying.</h2>
          <Link className="button button--light" href="/book">
            Book an appointment
            <ArrowUpRightIcon size={18} />
          </Link>
        </div>

        <div className="site-footer__columns">
          <div>
            <p className="footer-label">Explore</p>
            {navigation.map((item) => (
              <Link key={item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div>
            <p className="footer-label">Connect</p>
            <a href={brand.instagramUrl} target="_blank" rel="noreferrer">
              Instagram
            </a>
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            ) : null}
            {email ? <a href={email}>Email</a> : null}
            {contactPhone ? <a href={`tel:${contactPhone}`}>{contactPhone}</a> : null}
          </div>
          <div>
            <p className="footer-label">Available in</p>
            {brand.locations.map((location) => (
              <span key={location}>{location}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="page-shell site-footer__brand">
        <Logo light />
        <p>POCKET REELS 360</p>
      </div>

      <div className="page-shell site-footer__bottom">
        <p>© {new Date().getFullYear()} Pocket Reels 360</p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a
            href={brand.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Pocket Reels 360 on Instagram"
          >
            <InstagramIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
