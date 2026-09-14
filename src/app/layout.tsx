import type { Metadata, Viewport } from "next";
import { brand } from "@/content/site";
import { env } from "@/env";
import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteMotion } from "@/components/site-motion";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Pocket Reels 360 | iPhone Reels & Creative Video",
    template: "%s | Pocket Reels 360",
  },
  description:
    "Pocket Reels 360 is a reel-maker crew that shoots on iPhone, edits, and delivers across Dallas, NYC, Chicago, and Charlotte.",
  keywords: [
    "Pocket Reels 360",
    "reel maker",
    "iPhone reels",
    "creative video",
    "Dallas reels",
    "event reels",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: brand.name,
    title: "Pocket Reels 360 | Your spotlight, in motion",
    description:
      "A reel-maker crew that shoots, edits, and delivers hassle-free.",
    url: "/",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Pocket Reels 360 — Your spotlight, in motion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pocket Reels 360 | Your spotlight, in motion",
    description:
      "A reel-maker crew that shoots, edits, and delivers hassle-free.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/logo-mark.svg",
    shortcut: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#11100f",
  colorScheme: "light",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  url: env.NEXT_PUBLIC_SITE_URL,
  description: brand.description,
  sameAs: [brand.instagramUrl, brand.youtubeUrl],
  areaServed: brand.locations.map((name) => ({
    "@type": "City",
    name,
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const contact = {
    whatsappNumber: env.NEXT_PUBLIC_WHATSAPP_NUMBER,
    contactEmail: env.NEXT_PUBLIC_CONTACT_EMAIL,
    contactPhone: env.NEXT_PUBLIC_CONTACT_PHONE,
  };

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter {...contact} />
        <MobileActionBar whatsappNumber={contact.whatsappNumber} />
        <AssistantWidget
          whatsappNumber={contact.whatsappNumber}
          contactEmail={contact.contactEmail}
          contactPhone={contact.contactPhone}
        />
        <SiteMotion />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
