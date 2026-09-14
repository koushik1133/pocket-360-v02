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
    bestFor: ["Concerts & shows", "Launch parties", "Cultural events"],
    pricingNote: "Custom quote based on hours of coverage and turnaround.",
  },
  {
    id: "brand-reels",
    name: "Brand & business reels",
    tagline: "Short-form content that makes a brand feel in motion.",
    description:
      "Product, space, and story shot and edited for social — built to stop the scroll and stay on-brand.",
    bestFor: ["Local businesses", "Product launches", "Storefront & venue"],
    pricingNote: "Custom quote — single reel or an ongoing content batch.",
  },
  {
    id: "portrait-moments",
    name: "Portrait & personal moments",
    tagline: "The quiet, close-up details that carry a story.",
    description:
      "Candid, intimate vertical pieces for people and personal milestones, with a hands-off, unobtrusive shoot.",
    bestFor: ["Personal milestones", "Portrait sessions", "Keepsake reels"],
    pricingNote: "Custom quote based on session length.",
  },
  {
    id: "real-estate-reels",
    name: "Real estate reels",
    tagline: "Walk-throughs and spaces that sell the feeling.",
    description:
      "Property and interior reels that move through a space cleanly and highlight what matters to a buyer.",
    bestFor: ["Listings", "Interiors & venues", "Developments"],
    pricingNote: "Custom quote per property and shot list.",
  },
] as const;

/** Complementary add-ons the assistant may suggest as soft upsells. */
export const assistantAddOns: readonly string[] = [
  "Express / same-week edits when a deadline is tight",
  "Multi-day or multi-event coverage",
  "Licensed music and on-screen captions",
  "Story highlight covers to match the reel",
  "An ongoing monthly content batch instead of a one-off",
] as const;

/** How a project runs, matching the site's Shoot → Edit → Deliver process. */
export const assistantProcess: readonly {
  step: string;
  detail: string;
}[] = [
  {
    step: "Shoot",
    detail:
      "The crew captures vertical footage on iPhone, on location where the moment is happening.",
  },
  {
    step: "Edit",
    detail:
      "Footage is cut into concise, pace-led social reels built to move.",
  },
  {
    step: "Deliver",
    detail:
      "The same crew that followed the story hands off the finished reel, hassle-free.",
  },
] as const;

/**
 * FAQ answers written to be truthful without inventing specifics. Anything that
 * depends on scope (exact price, exact turnaround) is routed to a booked call.
 */
export const assistantFaqs: readonly { q: string; a: string }[] = [
  {
    q: "What do you shoot on?",
    a: "Everything is shot on iPhone — that keeps the crew fast, mobile, and close to the moment without a bulky setup.",
  },
  {
    q: "What do I get delivered?",
    a: "Finished vertical (9:16) reels ready for Instagram and other social platforms, delivered by the same crew that shot them.",
  },
  {
    q: "Where do you work?",
    a: `Pocket Reels 360 works across ${brand.locationLine}. Share where your project is and the crew will confirm coverage.`,
  },
  {
    q: "How much does it cost?",
    a: "Pricing is custom — it depends on the type of shoot, hours of coverage, and turnaround. The fastest way to get a real number is to book a quick call and share your project.",
  },
  {
    q: "How fast is turnaround?",
    a: "Turnaround depends on the shoot and how much footage there is. The crew confirms a timeline when your project is scoped, and express edits are possible when a deadline is tight.",
  },
  {
    q: "How do I book?",
    a: "Use the booking page to request a time, or message the crew directly — whichever is easier. You'll get a confirmation and a follow-up to lock in the details.",
  },
] as const;

export const assistantPersona = {
  name: "the Pocket Reels 360 assistant",
  /** Short one-liner shown in the widget header. */
  tagline: "Ask about reels, pricing, or book a call.",
  greeting:
    "Hi! I'm the Pocket Reels 360 assistant. I can walk you through our reels, help you pick the right shoot, or get you booked. What are you working on?",
} as const;

export function findService(id: string): AssistantService | undefined {
  return assistantServices.find((service) => service.id === id);
}
