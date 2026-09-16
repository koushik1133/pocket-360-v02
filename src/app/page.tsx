import Image from "next/image";
import Link from "next/link";
import {
  brand,
  feedItems,
  highlights,
  workItems,
} from "@/content/site";
import { env } from "@/env";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PlayIcon,
  WhatsAppIcon,
} from "@/components/icons";
import dynamic from "next/dynamic";
import { WorkGallery } from "@/components/work-gallery";
import { PinnedProcess } from "@/components/pinned-process";
import { FeaturedSpotlight } from "@/components/featured-spotlight";
import { Magnetic } from "@/motion/magnetic";
import { TextReveal } from "@/motion/text-reveal";
import { emailUrl, whatsappUrl } from "@/lib/contact-links";

const HeroCanvas = dynamic(
  () => import("@/components/hero-canvas").then((m) => m.HeroCanvas),
  {
    loading: () => (
      <div
        className="hero-canvas-container absolute inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        <div className="hero-fallback-ambient" />
      </div>
    ),
  },
);

const CurvedReelDial = dynamic(
  () => import("@/components/curved-reel-dial").then((m) => m.CurvedReelDial),
  {
    loading: () => (
      <section
        className="curved-dial-section relative min-h-[50vh] bg-ink text-white overflow-hidden flex flex-col justify-center py-16"
        style={{ backgroundColor: "#141312" }}
      >
        <div className="page-shell text-center">
          <p className="eyebrow eyebrow--light">IMMERSIVE REEL CYLINDER</p>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white mt-2">
            Scroll through <em className="font-serif text-accent italic font-normal">the reels.</em>
          </h2>
        </div>
      </section>
    ),
  },
);

export default function HomePage() {
  const whatsapp = whatsappUrl(env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const email = emailUrl(
    env.NEXT_PUBLIC_CONTACT_EMAIL,
    "Pocket Reels 360 project inquiry",
  );

  return (
    <>
      {/* ─── Hero Section with WebGL Ambient Layer & Parallax Panels ─── */}
      <section id="home" className="hero relative overflow-hidden">
        <HeroCanvas />

        <div className="hero__copy page-shell relative z-10">
          <div className="hero__content">
            <p className="eyebrow" data-reveal>
              Your viral reel-maker crew
            </p>
            <div className="hero__title-wrap" data-reveal>
              <TextReveal
                text="Your spotlight, in motion."
                as="h1"
                className="text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight"
                highlightWords={["in", "motion."]}
                highlightClass="text-accent font-serif italic"
              />
            </div>
            <p className="hero__lede mt-4" data-reveal>
              Pocket Reels shoots on iPhone, edits, and delivers hassle-free
              social reels for events, brands, and creators.
            </p>
            <div className="hero__actions mt-8 flex flex-wrap items-center gap-4" data-reveal>
              <Magnetic strength={0.4}>
                <Link className="button button--dark" href="/book">
                  Book an appointment
                  <ArrowUpRightIcon size={17} />
                </Link>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a className="button button--ghost" href="#work">
                  View our work
                  <ArrowRightIcon size={17} />
                </a>
              </Magnetic>
            </div>
          </div>
          <p className="hero__location" data-reveal>
            <MapPinIcon size={16} />
            {brand.locationLine}
          </p>
        </div>

        <div className="hero__visual relative z-10" aria-label="Pocket Reels 360 work">
          <div
            className="hero__panel hero__panel--one transition-transform duration-700 ease-out"
            data-parallax-speed="0.18"
            data-cursor="EXPLORE"
          >
            <Image
              src="/media/reel-henna.jpg"
              alt="Intricate henna art on hand, captured in warm close-up"
              fill
              priority
              sizes="(max-width: 768px) 45vw, (max-width: 1200px) 25vw, 360px"
            />
          </div>
          <div
            className="hero__panel hero__panel--two transition-transform duration-700 ease-out"
            data-parallax-speed="-0.25"
            data-cursor="EXPLORE"
          >
            <Image
              src="/media/reel-concert-aug28.jpg"
              alt="Artist performing live on stage, crowd lit by dramatic spotlights"
              fill
              priority
              sizes="(max-width: 768px) 45vw, (max-width: 1200px) 25vw, 360px"
            />
          </div>
          <div
            className="hero__panel hero__panel--three transition-transform duration-700 ease-out"
            data-parallax-speed="0.32"
            data-cursor="EXPLORE"
          >
            <Image
              src="/media/reel-kiran-dallas.jpg"
              alt="Kiran performing at a Dallas live event, warm stage lighting"
              fill
              priority
              sizes="18vw"
            />
          </div>
          <div className="hero__visual-label">
            <span>Shot on iPhone</span>
            <span>Reel stories</span>
          </div>
        </div>

        <a className="hero__scroll" href="#journey" aria-label="Scroll to explore">
          <span />
          Scroll
        </a>
      </section>

      {/* ─── Journey Preview Section ─── */}
      <section id="journey" className="journey section-pad">
        <div className="page-shell journey__top">
          <div data-reveal>
            <p className="eyebrow">Follow the journey</p>
            <TextReveal
              text={brand.handle}
              as="h2"
              className="text-2xl sm:text-4xl font-semibold text-ink"
            />
          </div>
          <div className="journey__proof" data-reveal>
            <span>2.8K+ followers</span>
            <a
              className="text-link"
              href={brand.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <InstagramIcon size={18} />
              View Instagram
              <ArrowUpRightIcon size={16} />
            </a>
          </div>
        </div>
        <div className="journey__rail" aria-label="Instagram preview">
          {feedItems.slice(0, 5).map((item, index) => (
            <a
              key={item.id}
              href={item.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className={`journey-card journey-card--${index + 1}`}
              data-cursor="VIEW"
              aria-label={`${item.title} on Instagram`}
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                sizes="(max-width: 700px) 58vw, 22vw"
              />
              <span>
                <InstagramIcon size={17} />
                {item.title}
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ─── About Section with Parallax Image Composition ─── */}
      <section id="about" className="about section-pad">
        <div className="page-shell about__grid">
          <div className="about__media" data-reveal>
            <div className="about__image-main" data-parallax-speed="0.12">
              <Image
                src="/media/reel-ata.jpg"
                alt="Candid moment inside the ATA event hall, warm ambient lighting"
                fill
                sizes="(max-width: 800px) 88vw, 42vw"
              />
            </div>
            <div className="about__image-small" data-parallax-speed="-0.2">
              <Image
                src="/media/reel-shawl.jpg"
                alt="Candid indoor portrait in a colourful woven shawl"
                fill
                sizes="(max-width: 800px) 42vw, 17vw"
              />
            </div>
            <p className="about__caption">Real moments. Vertical stories.</p>
          </div>

          <div className="about__copy" data-reveal>
            <p className="eyebrow">About Pocket Reels 360</p>
            <TextReveal
              text="Close to the action. Clear on the story."
              as="h2"
              className="text-2xl sm:text-4xl font-medium tracking-tight text-ink"
            />
            <p className="about__lead mt-4">
              Pocket Reels is a reel-maker crew built around a simple process:
              shoot, edit, and deliver.
            </p>
            <p className="mt-2 text-muted">
              The crew works from an iPhone-first point of view and shares
              people, live events, celebrations, real estate, and brand moments
              from Dallas, New York City, Chicago, and Charlotte.
            </p>
            <div className="pt-6">
              <a className="text-link text-link--large inline-flex items-center gap-2" href="#services">
                See the process
                <ArrowRightIcon size={19} />
              </a>
            </div>
          </div>
        </div>

        <div className="page-shell highlight-row mt-16" data-reveal>
          <p>Selected Instagram highlights</p>
          <div>
            {highlights.map((highlight) => (
              <a
                key={highlight.label}
                href={brand.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="highlight-row__image">
                  <Image
                    src={highlight.image}
                    alt=""
                    fill
                    sizes="64px"
                  />
                </span>
                {highlight.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pinned Storytelling Services Section ─── */}
      <section id="services" className="services-wrapper">
        <PinnedProcess />
      </section>

      {/* ─── Unified Work & Rally Gallery Section ─── */}
      <section id="work" className="work section-pad">
        <div className="page-shell">
          <div className="section-heading section-heading--wide mb-10" data-reveal>
            <div>
              <p className="eyebrow">Our work</p>
              <TextReveal
                text="Stories that keep moving."
                as="h2"
                className="text-3xl sm:text-5xl font-medium tracking-tight text-ink"
              />
            </div>
            <p className="text-muted max-w-md">
              Selected reels and frames from the Pocket Reels 360 Instagram feed.
              Explore our multi-stream Rally Wall or browse by category.
            </p>
          </div>

          <WorkGallery items={workItems} />
        </div>
      </section>

      {/* ─── Recent Reels Rail ─── */}
      <section id="reels" className="reels section-pad bg-ink text-white">
        <div className="page-shell">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow eyebrow--light">From the feed</p>
              <TextReveal
                text="Recent reels."
                as="h2"
                className="text-3xl sm:text-5xl font-medium tracking-tight text-white"
              />
            </div>
            <a
              className="text-link text-link--light"
              href={`${brand.instagramUrl}reels/`}
              target="_blank"
              rel="noreferrer"
            >
              View all reels
              <ArrowUpRightIcon size={17} />
            </a>
          </div>
        </div>

        <div className="reel-rail">
          {workItems.slice(0, 7).map((item, index) => (
            <a
              href={item.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="reel-card group"
              key={item.id}
              data-cursor="PLAY REEL"
            >
              <div className="reel-card__image overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 76vw, 22vw"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <span className="reel-card__play group-hover:scale-110 group-hover:bg-accent transition-all">
                  <PlayIcon size={22} />
                </span>
              </div>
              <div className="reel-card__copy">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item.title}</p>
                <ArrowUpRightIcon size={17} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── 3D Curved Reel Dial (Scroll Horizontal Arc) ─── */}
      <CurvedReelDial />

      {/* ─── Featured Spotlight Section with Scroll Zoom ─── */}
      <section className="featured section-pad overflow-hidden">
        {workItems[0] ? <FeaturedSpotlight item={workItems[0]} /> : null}
      </section>

      {/* ─── Editorial Booking Showcase ─── */}
      <section className="booking-editorial section-pad">
        <div className="page-shell booking-editorial__grid">
          <div className="booking-editorial__gallery" data-reveal>
            <div className="booking-editorial__main">
              <Image
                src="/media/reel-henna.jpg"
                alt="Project inspiration preview"
                fill
                sizes="(max-width: 800px) 94vw, 48vw"
              />
            </div>
            <div className="booking-editorial__thumbs">
              <div>
                <Image
                  src="/media/reel-concert-aug28.jpg"
                  alt="Live performance reel snapshot"
                  fill
                  sizes="22vw"
                />
              </div>
              <div>
                <Image
                  src="/media/reel-aurum.jpg"
                  alt="Luxury venue reel snapshot"
                  fill
                  sizes="22vw"
                />
              </div>
            </div>
          </div>

          <div className="booking-editorial__panel" data-reveal>
            <p className="eyebrow">Appointments</p>
            <h2>Put your next story in motion.</h2>
            <p>
              Share the moment, your preferred date and time, and the details
              the crew should know.
            </p>
            <dl className="booking-editorial__details">
              <div>
                <dt>Service</dt>
                <dd>Reel production</dd>
              </div>
              <div>
                <dt>Flow</dt>
                <dd>Shoot · Edit · Deliver</dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>Dallas · NYC · Chicago · Charlotte</dd>
              </div>
            </dl>
            <Link className="button button--dark button--wide" href="/book">
              Book an appointment
              <ArrowUpRightIcon size={17} />
            </Link>
            <div className="booking-editorial__links">
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  <WhatsAppIcon size={17} />
                  WhatsApp us
                </a>
              ) : null}
              {email ? (
                <a href={email}>
                  <MailIcon size={17} />
                  Email us
                </a>
              ) : null}
              <a href={brand.instagramUrl} target="_blank" rel="noreferrer">
                <InstagramIcon size={17} />
                Instagram DM
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Production Scheduling Dark Rounded Card ─── */}
      <section id="scheduling" className="production-scheduling section-pad">
        <div className="page-shell">
          <div className="rounded-3xl sm:rounded-[2.5rem] bg-[#141211] text-white p-7 sm:p-12 lg:p-14 relative overflow-hidden border border-white/10 shadow-2xl">
            {/* Subtle background warm gradient glow */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
              {/* Left Column: Heading, Description, Action Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-accent inline-block" />
                  <span className="w-5 h-[1.5px] bg-white/40 inline-block" />
                  <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/80 !m-0">
                    PRODUCTION SCHEDULING
                  </p>
                </div>

                <h2 className="text-2xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.06] text-balance">
                  Let&apos;s put your story in motion.
                </h2>

                <p className="text-white/70 text-base sm:text-lg max-w-md mt-5 leading-relaxed">
                  Choose your production date, specify your city (Dallas, NYC, Chicago, or Charlotte), and our crew will confirm coverage within hours.
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-8">
                  <Magnetic strength={0.3}>
                    <Link
                      href="/book"
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase bg-[#1e1c1a] border border-white/20 text-white hover:bg-white hover:text-black transition-all shadow-lg"
                    >
                      Book an appointment
                      <ArrowUpRightIcon size={16} />
                    </Link>
                  </Magnetic>

                  {whatsapp ? (
                    <Magnetic strength={0.3}>
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase bg-transparent border border-white/20 hover:border-white/60 text-white transition-all"
                      >
                        <WhatsAppIcon size={16} />
                        Quick WhatsApp Chat
                      </a>
                    </Magnetic>
                  ) : null}
                </div>
              </div>

              {/* Right Column: Luxury Interior Venue Image with Availability Badge */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] border border-white/10 shadow-2xl">
                  <Image
                    src="/media/reel-aurum.jpg"
                    alt="The Aurum luxury venue interior space"
                    fill
                    className="object-cover"
                    sizes="(max-width: 900px) 92vw, 45vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 z-10">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-mono tracking-widest uppercase text-white font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      NEXT AVAILABILITY: THIS WEEK
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Contact Section ─── */}
      <section id="contact" className="contact section-pad">
        <div className="page-shell contact__grid">
          <div>
            <p className="eyebrow">Contact</p>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-ink mt-2">
              Let&apos;s create something
              <br />
              <em className="font-serif text-accent italic">together.</em>
            </h2>
          </div>
          <div className="contact__details">
            <div>
              <p className="text-muted font-bold uppercase tracking-wider text-xs">Start here</p>
              <Link href="/book" className="text-ink hover:text-accent font-medium">Book an appointment</Link>
              <a href={brand.instagramUrl} target="_blank" rel="noreferrer" className="text-ink hover:text-accent font-medium">
                {brand.handle}
              </a>
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noreferrer" className="text-ink hover:text-accent font-medium">
                  Chat on WhatsApp
                </a>
              ) : null}
              {email ? <a href={email} className="text-ink hover:text-accent font-medium">{env.NEXT_PUBLIC_CONTACT_EMAIL}</a> : null}
            </div>
            <div>
              <p className="text-muted font-bold uppercase tracking-wider text-xs">Locations</p>
              {brand.locations.map((location) => (
                <span key={location} className="text-ink font-medium block py-0.5">{location}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Instagram CTA ─── */}
      <section className="instagram-cta section-pad">
        <div className="page-shell instagram-cta__inner">
          <InstagramIcon size={32} />
          <p className="eyebrow eyebrow--light">More from Pocket Reels 360</p>
          <TextReveal
            text="Follow the latest work, moments, and reels."
            as="h2"
            className="text-2xl sm:text-4xl font-medium tracking-tight text-white max-w-xl mx-auto my-4"
          />
          <Magnetic strength={0.4}>
            <a
              className="button button--light mt-2"
              href={brand.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Follow {brand.handle}
              <ArrowUpRightIcon size={18} />
            </a>
          </Magnetic>
        </div>
      </section>
    </>
  );
}
