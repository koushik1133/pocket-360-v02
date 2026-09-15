import type { Metadata } from "next";
import Image from "next/image";
import { BookingForm } from "@/components/booking-form";
import { MapPinIcon } from "@/components/icons";
import { brand } from "@/content/site";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Request a preferred date and time for reel production with Pocket Reels 360.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="booking-page">
      <section className="booking-page__intro page-shell">
        <div>
          <p className="eyebrow">Book an appointment</p>
          <h1>Let&apos;s put your story in motion.</h1>
        </div>
        <p>
          Select a preferred date and time, share your details, and the Pocket
          Reels crew will follow up to confirm.
        </p>
      </section>

      <section className="booking-page__experience page-shell">
        <aside className="booking-project" aria-label="Pocket Reels project imagery">
          <div className="booking-project__primary">
            <Image
              src="/media/reel-concert-aug28.jpg"
              alt="Artist performing live on stage — the kind of moment Pocket Reels captures"
              fill
              priority
              sizes="(max-width: 900px) 94vw, 45vw"
            />
            <span className="booking-project__shade" />
            <div className="booking-project__overlay">
              <p>Project / appointment</p>
              <h2>Reel production</h2>
              <span>Shoot · Edit · Deliver</span>
            </div>
          </div>
          <div className="booking-project__thumbs">
            <div>
              <Image
                src="/media/reel-henna.jpg"
                alt="Intricate henna art — portrait reel frame"
                fill
                sizes="22vw"
              />
            </div>
            <div>
              <Image
                src="/media/reel-grocery.jpg"
                alt="Signature India Grocery — brand reel frame"
                fill
                sizes="22vw"
              />
            </div>
          </div>
          <p className="booking-project__location">
            <MapPinIcon size={16} />
            {brand.locationLine}
          </p>
        </aside>

        <div className="booking-page__form">
          <BookingForm
            whatsappNumber={env.NEXT_PUBLIC_WHATSAPP_NUMBER}
            contactEmail={env.NEXT_PUBLIC_CONTACT_EMAIL}
          />
        </div>
      </section>
    </div>
  );
}
