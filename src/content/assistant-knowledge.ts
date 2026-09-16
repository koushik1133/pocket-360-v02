import { brand } from "@/content/site";

/**
 * Source of truth for what the AI assistant is allowed to say about Pocket
 * Reels 360. Keep this factual and free of invented numbers — no fixed prices,
 * turnaround days, or contact details. Pricing is always positioned as a custom
 * quote so the assistant never guesses figures the crew hasn't published.
 *
 * This module is imported by both the browser (to render service cards) and the
 * server (to build the system prompt), so it must stay dependency-light.
 */

export type AssistantService = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string[];
  /** Human-readable pricing note. Never a number. */
  pricingNote: string;
};

export const assistantServices: readonly AssistantService[] = [
  {
    id: "event-reels",
    name: "Event & live reels",
    tagline: "Concerts, launches, and celebrations, captured in motion.",
    description:
      "The crew follows the moment live — stage, crowd, and the details in between — and shapes it into pace-led vertical reels.",
    bestFor: ["Concerts & shows", "Launch parties", "Cultural festivals & celebrations", "Music tours"],
    pricingNote: "Custom quote based on hours of coverage and turnaround.",
  },
  {
    id: "brand-reels",
    name: "Brand & business reels",
    tagline: "Short-form content that makes a brand feel in motion.",
    description:
      "Product, space, and story shot and edited for social — built to stop the scroll and stay on-brand.",
    bestFor: ["Local businesses", "Product launches", "Storefront & venue showcases", "Corporate promotions"],
    pricingNote: "Custom quote — single reel or an ongoing content batch.",
  },
  {
    id: "portrait-moments",
    name: "Portrait & personal moments",
    tagline: "The quiet, close-up details that carry a story.",
    description:
      "Candid, intimate vertical pieces for people and personal milestones, with a hands-off, unobtrusive shoot.",
    bestFor: ["Personal milestones", "Portrait sessions", "Weddings & Sangeet", "Keepsake reels"],
    pricingNote: "Custom quote based on session length.",
  },
  {
    id: "real-estate-reels",
    name: "Real estate reels",
    tagline: "Walk-throughs and spaces that sell the feeling.",
    description:
      "Property and interior reels that move through a space cleanly and highlight what matters to a buyer.",
    bestFor: ["Listings", "Luxury developments", "Interiors & venues", "Architectural tours"],
    pricingNote: "Custom quote per property and shot list.",
  },
] as const;

/** Complementary add-ons the assistant may suggest as soft upsells. */
export const assistantAddOns: readonly string[] = [
  "Express 24-48h rapid turnaround when deadlines are tight",
  "Multi-day or multi-city event coverage across our 4 hubs",
  "Licensed trending music scoring and dynamic on-screen typography / captions",
  "Cohesive Instagram Story highlight covers matching your reel aesthetic",
  "Ongoing monthly creator / business retainer batches",
] as const;

/** Hubs and coverage regions */
export const assistantHubs = {
  headquarters: "Dallas, TX",
  activeHubs: ["Dallas", "New York City", "Chicago", "Charlotte"],
  travelCoverage: "Available for on-location destination shoots and tours across the United States upon request.",
} as const;

/** Technical gear & filming approach */
export const assistantGearAndTech = {
  camera: "Apple iPhone Pro Max (4K 60fps HDR ProRes / Apple Log capture)",
  stabilization: "3-axis mobile gimbals and fluid handheld movement",
  audio: "Pro wireless lavalier microphones and ambient stage audio capture",
  lighting: "Ultra-compact high-CRI bi-color LED key and rim lighting",
  philosophy: "Agile, nimble, and unobtrusive on-location filming that stays right where the action happens without bulky cinema rigs.",
} as const;

/** Notable portfolio highlights and artists covered */
export const assistantPortfolioHighlights = [
  "Anirudh Ravichander live concert ('Anirudh's Magic') — dynamic concert stage visual reels",
  "Kiran Vocals live Dallas night performance",
  "Prabudeva & Noel live dance & tour moments",
  "Orange Band live music performance",
  "Varanasi cultural showcase",
  "The Aurum Reality & The Wealth Room — luxury real estate reels",
  "Signature India Grocery — retail brand spotlight",
  "ATA (American Telugu Association) convention coverage",
  "Mass Jathara live festival performance",
] as const;

/** How a project runs, matching the site's Shoot → Edit → Deliver process. */
export const assistantProcess: readonly {
  step: string;
  detail: string;
}[] = [
  {
    step: "Shoot",
    detail:
      "The crew captures vertical footage on iPhone 4K ProRes on location where the moment is happening — agile, intimate, and authentic.",
  },
  {
    step: "Edit",
    detail:
      "Footage is cut into concise, pace-led social reels with rhythm editing, dynamic sound design, and color grading built to stop the scroll.",
  },
  {
    step: "Deliver",
    detail:
      "The same crew that followed the story hands off finished, ready-to-post 9:16 vertical reels hassle-free with rapid turnaround.",
  },
] as const;

/** Privacy policy knowledge summary */
export const assistantPrivacyKnowledge = {
  summary:
    "Pocket Reels 360 values your privacy. We only collect the details you provide in our booking form (name, email, phone, event date, location/venue, and project scope) strictly to coordinate and deliver your video shoot. We never sell, rent, or share personal information with third parties. All submissions are processed securely with server-side encryption and spam prevention.",
  openUrl: "/privacy",
  contact: "@pocketreels360 on Instagram",
} as const;

/** Terms & Conditions knowledge summary */
export const assistantTermsKnowledge = {
  summary:
    "Pocket Reels 360 provides vertical video shoot, edit, and delivery services based on custom scoped agreements. Booking submissions are confirmed by our crew within 24 hours. Full terms cover project scopes, delivery formats (9:16 vertical), and copyright handoffs.",
  openUrl: "/terms",
} as const;

/**
 * FAQ answers written to be truthful without inventing specifics. Anything that
 * depends on scope (exact price, exact turnaround) is routed to a booked call.
 */
export const assistantFaqs: readonly { q: string; a: string }[] = [
  {
    q: "What do you shoot on?",
    a: "Everything is shot on iPhone in 4K ProRes — keeping the crew agile, mobile, and close to the action without bulky camera rigs getting in the way.",
  },
  {
    q: "What do I get delivered?",
    a: "Finished 9:16 vertical reels ready to post on Instagram, TikTok, and YouTube Shorts, delivered directly by the crew.",
  },
  {
    q: "Where do you operate?",
    a: `Pocket Reels 360 operates across ${brand.locationLine} (Dallas, NYC, Chicago, Charlotte), and travels nationwide for select events and tours.`,
  },
  {
    q: "How much does it cost?",
    a: "Every project is custom-quoted based on shoot hours, location, number of reels, and turnaround speed. Book an enquiry or quick call to get a clear package quote within 24 hours.",
  },
  {
    q: "How fast is turnaround?",
    a: "Standard turnaround is typically 24 to 48 hours for social reels. Same-week and rush options are also available for live events.",
  },
  {
    q: "How do I book or get in touch?",
    a: "Submit an enquiry on our booking page (/book) with your event details, date, and location. Our crew reviews every request and confirms back within 24 hours.",
  },
  {
    q: "What is your privacy policy?",
    a: "We only use your contact and event details to coordinate your shoot. We never sell your data or send spam. You can view our full privacy policy anytime at /privacy.",
  },
] as const;

export const assistantPersona = {
  name: "the Pocket Reels 360 assistant",
  tagline: "Ask about reels, pricing, hubs, or book a shoot.",
  greeting:
    "Hi! I'm the Pocket Reels 360 assistant. I can walk you through our vertical reel services, show you our work, answer policy questions, or get you booked for a shoot. What can I help you with today?",
} as const;

export function findService(id: string): AssistantService | undefined {
  return assistantServices.find((service) => service.id === id);
}

