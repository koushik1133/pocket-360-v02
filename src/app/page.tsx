import Image from "next/image";
import Link from "next/link";
import {
  brand,
  feedItems,
  highlights,
  reelProcess,
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
import { WorkGallery } from "@/components/work-gallery";
import { emailUrl, whatsappUrl } from "@/lib/contact-links";

export default function HomePage() {
  const whatsapp = whatsappUrl(env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const email = emailUrl(
    env.NEXT_PUBLIC_CONTACT_EMAIL,
    "Pocket Reels 360 project inquiry",
  );

  return (
    <>
      <section id="home" className="hero">
        <div className="hero__copy page-shell">
          <div className="hero__content">
            <p className="eyebrow" data-reveal>
              Your viral reel-maker crew
            </p>
            <h1 data-reveal>
              Your spotlight,
              <br />
              <em>in motion.</em>
            </h1>
            <p className="hero__lede" data-reveal>
              Pocket Reels shoots on iPhone, edits, and delivers hassle-free
              social reels.
            </p>
            <div className="hero__actions" data-reveal>
              <Link className="button button--dark" href="/book">
                Book an appointment
                <ArrowUpRightIcon size={17} />
              </Link>
              <a className="button button--ghost" href="#work">
                View our work
                <ArrowRightIcon size={17} />
              </a>
            </div>
          </div>
          <p className="hero__location">
            <MapPinIcon size={16} />
            {brand.locationLine}
          </p>
        </div>

        <div className="hero__visual" aria-label="Pocket Reels 360 work">
          <div className="hero__panel hero__panel--one">
            <Image
              src="/media/reel-henna.jpg"
              alt="Temporary placeholder for a portrait-moment reel"
              fill
              priority
              sizes="(max-width: 800px) 50vw, 22vw"
            />
          </div>
          <div className="hero__panel hero__panel--two">
            <Image
              src="/media/reel-concert-aug28.jpg"
              alt="Temporary placeholder for a concert stage reel"
              fill
              priority
              sizes="(max-width: 800px) 50vw, 22vw"
            />
          </div>
          <div className="hero__panel hero__panel--three">
            <Image
              src="/media/reel-kiran-dallas.jpg"
              alt="Temporary placeholder for a Dallas event reel"
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

      <section id="journey" className="journey">
        <div className="page-shell journey__top">
          <div data-reveal>
            <p className="eyebrow">Follow the journey</p>
            <h2>{brand.handle}</h2>
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

      <section id="about" className="about section-pad">
        <div className="page-shell about__grid">
          <div className="about__media" data-reveal>
            <div className="about__image-main">
              <Image
                src="/media/reel-ata.jpg"
                alt="Temporary placeholder for an event portrait"
                fill
                sizes="(max-width: 800px) 88vw, 42vw"
              />
            </div>
            <div className="about__image-small">
              <Image
                src="/media/reel-shawl.jpg"
                alt="Temporary placeholder for a candid indoor moment"
                fill
                sizes="(max-width: 800px) 42vw, 17vw"
              />
            </div>
            <p className="about__caption">Real moments. Vertical stories.</p>
          </div>

          <div className="about__copy" data-reveal>
            <p className="eyebrow">About Pocket Reels 360</p>
            <h2>Close to the action. Clear on the story.</h2>
            <p className="about__lead">
              Pocket Reels is a reel-maker crew built around a simple process:
              shoot, edit, and deliver.
            </p>
            <p>
              The crew works from an iPhone-first point of view and shares
              people, live events, celebrations, real estate, and brand moments
              from Dallas, New York City, Chicago, and Charlotte.
            </p>
            <a className="text-link text-link--large" href="#services">
              See the process
              <ArrowRightIcon size={19} />
            </a>
          </div>
        </div>

        <div className="page-shell highlight-row" data-reveal>
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

      <section id="services" className="services section-pad">
        <div className="page-shell">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow">The reel-making flow</p>
              <h2>From pocket to feed.</h2>
            </div>
            <p>
              One crew follows the moment from capture through the final
              handoff.
            </p>
          </div>

          <div className="service-grid">
            {reelProcess.map((service) => (
              <article className="service-card" key={service.name} data-reveal>
                <div className="service-card__media">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 760px) 90vw, 31vw"
                  />
                  <span className="service-card__number">{service.index}</span>
                  <span className="service-card__action">
                    <ArrowUpRightIcon size={21} />
                  </span>
                </div>
                <div className="service-card__copy">
                  <p>{service.name}</p>
                  <h3>{service.title}</h3>
                  <span>{service.description}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="work" className="work section-pad">
        <div className="page-shell">
          <div className="section-heading section-heading--wide" data-reveal>
            <div>
              <p className="eyebrow">Our work</p>
              <h2>Stories that keep moving.</h2>
            </div>
            <p>
              Selected reels and frames from the Pocket Reels 360 Instagram
              feed.
            </p>
          </div>
          <WorkGallery items={workItems} />
        </div>
      </section>

      <section id="reels" className="reels section-pad">
        <div className="page-shell">
          <div className="section-heading" data-reveal>
            <div>
              <p className="eyebrow eyebrow--light">From the feed</p>
              <h2>Recent reels.</h2>
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
              className="reel-card"
              key={item.id}
              data-reveal
            >
              <div className="reel-card__image">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 76vw, 22vw"
                />
                <span className="reel-card__play">
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

      <section className="featured section-pad">
        <div className="page-shell">
          <div className="featured__label" data-reveal>
            <p className="eyebrow">Featured work</p>
            <p>Live &amp; events</p>
          </div>
          <a
            href={workItems[0]?.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="featured__media"
            data-reveal
          >
            <Image
              src="/media/reel-concert-aug28.jpg"
              alt="Temporary placeholder for live-stage footage"
              fill
              sizes="95vw"
            />
            <span className="featured__wash" />
            <span className="featured__copy">
              <small>In the room</small>
              <strong>Live from the stage</strong>
              <span>
                View original reel
                <ArrowUpRightIcon size={18} />
              </span>
            </span>
          </a>
        </div>
      </section>

      <section className="booking-editorial section-pad">
        <div className="page-shell booking-editorial__grid">
          <div className="booking-editorial__gallery" data-reveal>
            <div className="booking-editorial__main">
              <Image
                src="/media/reel-henna.jpg"
                alt="Temporary placeholder for project inspiration"
                fill
                sizes="(max-width: 800px) 94vw, 48vw"
              />
            </div>
            <div className="booking-editorial__thumbs">
              <div>
                <Image
                  src="/media/reel-concert-aug28.jpg"
                  alt=""
                  fill
                  sizes="22vw"
                />
              </div>
              <div>
                <Image
                  src="/media/reel-aurum.jpg"
                  alt=""
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

      <section id="contact" className="contact section-pad">
        <div className="page-shell contact__grid">
          <div data-reveal>
            <p className="eyebrow">Contact</p>
            <h2>
              Let&apos;s create something
              <br />
              <em>together.</em>
            </h2>
          </div>
          <div className="contact__details" data-reveal>
            <div>
              <p>Start here</p>
              <Link href="/book">Book an appointment</Link>
              <a href={brand.instagramUrl} target="_blank" rel="noreferrer">
                {brand.handle}
              </a>
              {whatsapp ? (
                <a href={whatsapp} target="_blank" rel="noreferrer">
                  Chat on WhatsApp
                </a>
              ) : null}
              {email ? <a href={email}>{env.NEXT_PUBLIC_CONTACT_EMAIL}</a> : null}
            </div>
            <div>
              <p>Locations</p>
              {brand.locations.map((location) => (
                <span key={location}>{location}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="instagram-cta">
        <div className="page-shell instagram-cta__inner" data-reveal>
          <InstagramIcon size={28} />
          <p>More from Pocket Reels 360</p>
          <h2>Follow the latest work, moments, and reels.</h2>
          <a
            className="button button--dark"
            href={brand.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            Follow {brand.handle}
            <ArrowUpRightIcon size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
