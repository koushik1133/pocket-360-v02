"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reelProcess } from "@/content/site";
import { ArrowRightIcon } from "@/components/icons";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function PinnedProcess() {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    // Only apply heavy pinning on desktop viewports
    const isDesktop = window.matchMedia("(min-width: 900px)").matches;
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      const stepCount = reelProcess.length;

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${stepCount * 120}%`,
        pin: true,
        scrub: 0.8,
        onUpdate: (self) => {
          const progress = self.progress;
          const stepIndex = Math.min(
            stepCount - 1,
            Math.floor(progress * stepCount),
          );
          setActiveStep(stepIndex);
        },
      });

      return () => {
        trigger.kill();
      };
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pinned-process relative w-full min-h-[90vh] md:min-h-screen flex items-center py-16"
    >
      <div className="page-shell w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left Column: Headline, Step Counter, and Synchronized Copy */}
          <div
            ref={leftPanelRef}
            className="lg:col-span-5 flex flex-col justify-center space-y-6"
          >
            <div>
              <p className="eyebrow">The reel-making flow</p>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mt-2 text-ink">
                From pocket
                <br />
                <em className="font-serif text-accent">to feed.</em>
              </h2>
            </div>

            {/* Step Progress Indicators */}
            <div
              className="flex items-center gap-3 pt-2"
              role="tablist"
              aria-label="Process steps"
            >
              {reelProcess.map((step, idx) => (
                <button
                  key={step.index}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`flex items-center gap-2 pb-2 text-xs font-semibold tracking-wider transition-all duration-300 border-b-2 ${
                    activeStep === idx
                      ? "border-accent text-ink"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                  aria-selected={activeStep === idx}
                  role="tab"
                >
                  <span>{step.index}</span>
                  <span className="uppercase">{step.name}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Step Content */}
            <div className="relative min-h-[140px] pt-4">
              {reelProcess.map((step, idx) => (
                <div
                  key={step.name}
                  className={`transition-all duration-500 absolute inset-x-0 top-4 ${
                    activeStep === idx
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  <h3 className="text-xl md:text-2xl font-semibold text-ink mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted leading-relaxed text-sm md:text-base max-w-md">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <a
                className="text-link text-link--large inline-flex items-center gap-2"
                href="#work"
              >
                Explore work sample
                <ArrowRightIcon size={18} />
              </a>
            </div>
          </div>

          {/* Right Column: Layered Morphing Visuals */}
          <div className="lg:col-span-7 relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/3] rounded-2xl overflow-hidden bg-paper shadow-2xl border border-line">
            {reelProcess.map((step, idx) => (
              <div
                key={`visual-${step.name}`}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  activeStep === idx
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-105 z-0"
                }`}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <span className="text-xs font-semibold tracking-widest text-accent-soft uppercase">
                      Phase {step.index}
                    </span>
                    <p className="text-lg font-medium text-white">{step.name}</p>
                  </div>
                  <span className="text-xs bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full font-medium">
                    Shot on iPhone
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
