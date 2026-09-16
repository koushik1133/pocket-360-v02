"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, MapPinIcon } from "@/components/icons";
import { brand } from "@/content/site";
import { BookingForm } from "@/components/booking-form";

const stages = [
  {
    id: "01",
    label: "Shoot",
    subtext: "Shot on iPhone.",
    stageTag: "STAGE 01 · SHOOT",
    headline: "Shot on iPhone.",
    description:
      "Pocket Reels captures vertical footage right where the live moment is happening.",
    image: "/media/reel-concert-aug28.jpg",
    alt: "Live stage lighting and audience capture — Pocket Reels production",
    iso: "ISO 400 · 1/120s",
    mode: "Live Capture",
  },
  {
    id: "02",
    label: "Edit",
    subtext: "Built to move.",
    stageTag: "STAGE 02 · EDIT",
    headline: "Built to move.",
    description:
      "Captured moments are sculpted into concise, rhythm-cut social reels within 24 to 48 hours.",
    image: "/media/reel-anirudh.jpg",
    alt: "Dynamic rhythm editing and color grading on vertical reels",
    iso: "PRORES 422 · 60 FPS",
    mode: "Timeline Cut",
  },
  {
    id: "03",
    label: "Deliver",
    subtext: "Hassle-free handoff.",
    stageTag: "STAGE 03 · DELIVER",
    headline: "Hassle-free handoff.",
    description:
      "A finished 4K vertical reel delivered directly to you, ready for instant posting to Instagram & TikTok.",
    image: "/media/reel-henna.jpg",
    alt: "Final polished 4K vertical reel delivery",
    iso: "4K 9:16 · COLOR GRADED",
    mode: "Master Delivery",
  },
] as const;

type BookingFlowExperienceProps = {
  whatsappNumber?: string;
  contactEmail?: string;
};

export function BookingFlowExperience({
  whatsappNumber,
  contactEmail,
}: BookingFlowExperienceProps) {
  const [activeStage, setActiveStage] = useState(0);
  const [timecode, setTimecode] = useState("00:01:42:19");

  // Timecode live ticker effect
  useEffect(() => {
    let frame = 19;
    let sec = 42;
    let min = 1;
    const interval = setInterval(() => {
      frame += 1;
      if (frame >= 30) {
        frame = 0;
        sec += 1;
        if (sec >= 60) {
          sec = 0;
          min += 1;
        }
      }
      setTimecode(
        `00:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}:${String(frame).padStart(2, "0")}`,
      );
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const currentStage = stages[activeStage] || stages[0];

  return (
    <div className="booking-experience-wrapper">
      {/* ─── Hero Section: 3-Step Production Flow + Viewfinder ─── */}
      <section className="booking-hero-section page-shell pt-28 sm:pt-32 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Heading + Interactive Stage Selector Cards */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-4 h-[2px] bg-accent inline-block" />
              <p className="eyebrow text-accent font-semibold tracking-wider !m-0">
                THE 3-STEP PRODUCTION FLOW
              </p>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[4.2rem] font-medium tracking-tight text-ink leading-[1.04]">
              FROM POCKET{" "}
              <em className="font-serif text-accent italic font-normal block sm:inline">
                to feed.
              </em>
            </h1>

            <p className="text-ink-soft text-base sm:text-lg max-w-lg mt-4 leading-relaxed">
              One dedicated crew follows your story from live capture through
              rhythm editing to final delivery within 24 to 48 hours.
            </p>

            {/* 3 Interactive Step Cards */}
            <div
              className="flex flex-col gap-3.5 mt-8 max-w-md"
              role="tablist"
              aria-label="3-Step Production Flow stages"
            >
              {stages.map((stage, idx) => {
                const isActive = activeStage === idx;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveStage(idx)}
                    className={`relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                      isActive
                        ? "bg-surface border-line shadow-md shadow-ink/5 translate-x-1"
                        : "bg-surface/40 border-line/50 hover:bg-surface/80 hover:border-line text-ink-soft"
                    }`}
                  >
                    <span
                      className={`font-mono font-bold text-sm tracking-wider transition-colors duration-200 ${
                        isActive ? "text-accent" : "text-muted"
                      }`}
                    >
                      {stage.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <strong
                        className={`block text-sm font-semibold transition-colors duration-200 ${
                          isActive ? "text-ink" : "text-ink-soft"
                        }`}
                      >
                        {stage.label}
                      </strong>
                      <small className="text-xs text-muted block mt-0.5">
                        {stage.subtext}
                      </small>
                    </div>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-accent" />
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* See Finished Work CTA button */}
            <div className="pt-6">
              <Link
                href="/#work"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink hover:text-accent hover:border-accent/40 transition-all px-5 py-3 rounded-full border border-ink/20 bg-surface shadow-xs"
              >
                See finished work
                <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>

          {/* Right Column: Full-Height Camera Viewfinder HUD */}
          <div className="lg:col-span-6 w-full lg:sticky lg:top-28">
            <div className="relative rounded-3xl overflow-hidden bg-ink text-white border border-white/10 shadow-2xl aspect-[3/4] sm:aspect-[9/13] lg:aspect-[9/12] w-full max-w-lg mx-auto">
              
              {/* Dynamic Stage Background Image with smooth transition */}
              <Image
                key={currentStage.id}
                src={currentStage.image}
                alt={currentStage.alt}
                fill
                priority
                className="object-cover transition-opacity duration-700 ease-out"
                sizes="(max-width: 900px) 94vw, 45vw"
              />
              
              {/* Dark Gradient Overlay for camera look */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/25 to-ink/40 pointer-events-none" />

              {/* Viewfinder Corner Framing Brackets */}
              <div className="absolute inset-3 sm:inset-4 pointer-events-none border border-white/10 rounded-2xl">
                <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/70" />
                <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/70" />
                <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/70" />
                <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/70" />
              </div>

              {/* Top Viewfinder HUD Meta: REC + Timecode + 4K badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-wider text-white/90 z-10 pointer-events-none">
                <div className="flex items-center gap-2 bg-ink/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-red-400">REC</span>
                  <span>{timecode}</span>
                </div>
                <div className="flex items-center gap-1.5 opacity-90 text-[10px] bg-ink/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  <span className="font-semibold">4K HDR</span>
                  <span>•</span>
                  <span>60 FPS</span>
                  <span>•</span>
                  <span>ProRes 422 HQ</span>
                </div>
              </div>

              {/* Center Crosshair Viewfinder Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="relative w-8 h-8">
                  <span className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/60 -translate-y-1/2" />
                  <span className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/60 -translate-x-1/2" />
                  <span className="absolute inset-1.5 border border-white/50 rounded-full" />
                </div>
              </div>

              {/* Bottom HUD Information Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <div className="p-4 sm:p-5 rounded-2xl bg-ink/85 backdrop-blur-md border border-white/15 shadow-xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                      {currentStage.stageTag}
                    </span>
                    <span className="text-[10px] font-mono text-white/60 uppercase">
                      {currentStage.mode}
                    </span>
                  </div>

                  <strong className="text-base sm:text-lg font-semibold text-white block">
                    {currentStage.headline}
                  </strong>
                  
                  <p className="text-xs text-white/80 mt-1 leading-relaxed">
                    {currentStage.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-white/60 pt-3 mt-3 border-t border-white/10">
                    <span>{currentStage.iso}</span>
                    <span className="flex items-center gap-1 text-white/90">
                      <MapPinIcon size={12} />
                      {brand.locationLine}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Seamless Appointment Booking Section ─── */}
      <section
        id="appointment-booking"
        className="booking-form-section page-shell pb-28 pt-8"
        aria-label="Appointment booking form"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow text-accent font-semibold tracking-wider">
              ONLINE RESERVATION
            </p>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-ink mt-2">
              Book your reel appointment.
            </h2>
            <p className="text-ink-soft text-sm sm:text-base max-w-lg mx-auto mt-2 leading-relaxed">
              Select your package, choose a preferred date, and share your
              project details. Our crew reviews every enquiry within 24 hours.
            </p>
          </div>

          <BookingForm
            whatsappNumber={whatsappNumber}
            contactEmail={contactEmail}
          />
        </div>
      </section>
    </div>
  );
}
