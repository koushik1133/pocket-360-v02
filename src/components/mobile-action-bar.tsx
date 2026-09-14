"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand } from "@/content/site";
import {
  CalendarIcon,
  InstagramIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { whatsappUrl } from "@/lib/contact-links";

export function MobileActionBar({
  whatsappNumber,
}: {
  whatsappNumber?: string;
}) {
  const pathname = usePathname();
  const whatsapp = whatsappUrl(whatsappNumber);
  if (pathname === "/book") return null;

  return (
    <>
      {whatsapp ? (
        <a
          className="floating-whatsapp"
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Pocket Reels 360 on WhatsApp"
        >
          <WhatsAppIcon size={24} />
          <span>Chat on WhatsApp</span>
        </a>
      ) : null}

      <nav className="mobile-action-bar" aria-label="Quick actions">
        <Link href="/book">
          <CalendarIcon size={19} />
          <span>Book</span>
        </Link>
        {whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noreferrer">
            <WhatsAppIcon size={19} />
            <span>WhatsApp</span>
          </a>
        ) : null}
        <a href={brand.instagramUrl} target="_blank" rel="noreferrer">
          <InstagramIcon size={19} />
          <span>Instagram</span>
        </a>
      </nav>
    </>
  );
}
