import type { Metadata, Viewport } from "next";
import { brand } from "@/content/site";
import { env } from "@/env";
import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteMotion } from "@/components/site-motion";
import { LenisProvider } from "@/motion/lenis-provider";
import { CustomCursor } from "@/motion/custom-cursor";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
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
    "reel maker Dallas",
    "iPhone reels NYC",
    "creative video Chicago",
    "event reels Charlotte",
    "wedding reels production",
    "concert videography iPhone",
    "luxury real estate reels",
    "vertical video production",
    "4K ProRes iPhone video",
    "social media video crew",
  ],
  authors: [{ name: "Pocket Reels 360" }, { name: "KVS Developers" }],
  creator: "Pocket Reels 360",
  publisher: "Pocket Reels 360",
  category: "Video Production",
  alternates: { canonical: "/" },
  other: {
    "geo.region": "US-TX",
    "geo.placename": "Dallas",
    "geo.position": "32.7767;-96.7970",
    "ICBM": "32.7767, -96.7970",
    "coverage": "Dallas, New York City, Chicago, Charlotte, United States",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: brand.name,
    title: "Pocket Reels 360 | iPhone Reels & Creative Video Production",
    description:
      "A premier reel-maker crew shooting exclusively on iPhone in 4K ProRes across Dallas, NYC, Chicago, and Charlotte. 24-48hr turnaround.",
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
    title: "Pocket Reels 360 | iPhone Reels & Creative Video Production",
    description:
      "A premier reel-maker crew shooting exclusively on iPhone in 4K ProRes across Dallas, NYC, Chicago, and Charlotte.",
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
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${env.NEXT_PUBLIC_SITE_URL}/#organization`,
      name: brand.name,
      url: env.NEXT_PUBLIC_SITE_URL,
      logo: `${env.NEXT_PUBLIC_SITE_URL}/logo-mark.svg`,
      image: `${env.NEXT_PUBLIC_SITE_URL}/opengraph-image`,
      description: brand.description,
      priceRange: "$$",
      telephone: env.NEXT_PUBLIC_CONTACT_PHONE || "+1-469-555-0199",
      email: env.NEXT_PUBLIC_CONTACT_EMAIL || "koushik.lf38@gmail.com",
      sameAs: [brand.instagramUrl, brand.youtubeUrl],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Dallas",
        addressRegion: "TX",
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 32.7767,
        longitude: -96.797,
      },
      areaServed: [
        {
          "@type": "City",
          name: "Dallas",
          containedInPlace: { "@type": "State", name: "Texas" },
        },
        {
          "@type": "City",
          name: "New York City",
          containedInPlace: { "@type": "State", name: "New York" },
        },
        {
          "@type": "City",
          name: "Chicago",
          containedInPlace: { "@type": "State", name: "Illinois" },
        },
        {
          "@type": "City",
          name: "Charlotte",
          containedInPlace: { "@type": "State", name: "North Carolina" },
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Pocket Reels 360 Video Production Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Wedding & Reception Reels",
              description: "High-paced, vertical 4K iPhone coverage for weddings and milestones.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Live Concerts & Events Reels",
              description: "Agile on-stage and crowd capture with pro wireless audio.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Brand & Commercial Launch Reels",
              description: "Architectural, corporate, and retail brand story campaigns.",
            },
          },
        ],
      },
    },
  ],
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
        <LenisProvider>
          <CustomCursor />
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter {...contact} />
          <MobileActionBar whatsappNumber={contact.whatsappNumber} />
          <AssistantWidget
            whatsappNumber={contact.whatsappNumber}
            contactEmail={contact.contactEmail}
            contactPhone={contact.contactPhone}
          />
          <CookieConsentBanner />
          <SiteMotion />
        </LenisProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
