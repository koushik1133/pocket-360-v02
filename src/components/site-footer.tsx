import Link from "next/link";
import { brand, navigation } from "@/content/site";
import { ArrowUpRightIcon, InstagramIcon } from "@/components/icons";
import { FooterWordmark } from "@/components/logo";
import { Magnetic } from "@/motion/magnetic";
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
    <footer className="site-footer bg-ink text-white relative overflow-hidden">
      <div className="page-shell site-footer__top">
        <div className="site-footer__intro">
          <p className="eyebrow eyebrow--light">Your spotlight, in motion</p>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white my-4">
            Let&apos;s create something
            <br />
            <em className="font-serif text-accent italic">worth replaying.</em>
          </h2>
          <div className="pt-4">
            <Magnetic strength={0.35}>
              <Link className="button button--light" href="/book">
                Book an appointment
                <ArrowUpRightIcon size={18} />
              </Link>
            </Magnetic>
          </div>
        </div>

        <div className="site-footer__columns">
          <nav aria-label="Site navigation">
            <p className="footer-label text-white/50">Explore</p>
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>
          <div>
            <p className="footer-label text-white/50">Connect</p>
            <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              Instagram
            </a>
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                WhatsApp
              </a>
            ) : null}
            {email ? <a href={email} className="hover:text-white transition-colors">Email</a> : null}
            {contactPhone ? <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">{contactPhone}</a> : null}
          </div>
          <div>
            <p className="footer-label text-white/50">Available in</p>
            {brand.locations.map((location) => (
              <span key={location} className="text-white/70 block py-0.5">{location}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Signature Large Cinematic Wordmark */}
      <div className="page-shell border-t border-white/10 my-8 pt-8">
        <FooterWordmark />
      </div>

      <div className="page-shell site-footer__bottom border-t border-white/10 pt-6">
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Pocket Reels 360 · All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs text-white/60">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <a
            href={brand.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Pocket Reels 360 on Instagram"
            className="hover:text-white"
          >
            <InstagramIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
