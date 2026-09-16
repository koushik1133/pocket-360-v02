import { Instrument_Serif, Manrope } from "next/font/google";

/**
 * Brand typography, self-hosted at build time by next/font so no request ever
 * leaves for Google at runtime (and the CSP `font-src 'self'` stays intact).
 *
 * Manrope: a wide, geometric grotesk that reads well in the tight uppercase
 * eyebrows and buttons the site relies on. Instrument Serif italic supplies
 * the editorial accent words ("in motion.", "the reels.").
 */
export const sans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-next",
  fallback: ["Avenir Next", "Avenir", "Helvetica Neue", "Arial", "sans-serif"],
});

export const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic", "normal"],
  display: "swap",
  variable: "--font-serif-next",
  fallback: ["Iowan Old Style", "Baskerville", "Times New Roman", "serif"],
});
