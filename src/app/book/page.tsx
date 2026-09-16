import type { Metadata } from "next";
import { BookingFlowExperience } from "@/components/booking-flow-experience";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Book an Appointment / Submit Enquiry",
  description:
    "Request a preferred date and package for vertical reel production with Pocket Reels 360.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <main className="booking-page min-h-screen bg-ivory">
      <BookingFlowExperience
        whatsappNumber={env.NEXT_PUBLIC_WHATSAPP_NUMBER}
        contactEmail={env.NEXT_PUBLIC_CONTACT_EMAIL}
      />
    </main>
  );
}
