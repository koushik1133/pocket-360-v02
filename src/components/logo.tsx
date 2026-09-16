import Link from "next/link";

type LogoProps = {
  compact?: boolean;
  light?: boolean;
  className?: string;
  href?: string;
};

export function LogoMark({
  className = "",
  title,
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M36.6 11.6A17 17 0 1 0 39.7 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M33.8 8.1 38 11.4l-4 3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="logo-mark__play"
        d="m20.2 16.8 12 7.2-12 7.2V16.8Z"
        fill="currentColor"
      />
      <circle className="logo-mark__dot" cx="38.1" cy="34.2" r="3.2" />
    </svg>
  );
}

export function Logo({
  compact = false,
  light = false,
  className = "",
  href = "/",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`logo ${light ? "logo--light" : ""} ${className} group`}
      aria-label="Pocket Reels 360 home"
    >
      <LogoMark className="logo__mark transition-transform duration-500 group-hover:rotate-45" />
      {!compact ? (
        <span className="logo__wordmark">
          <span>POCKET</span>
          <span>
            REELS <b>360</b>
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export function FooterWordmark() {
  return (
    <div className="footer-wordmark select-none w-full max-w-full overflow-hidden text-center py-6">
      <div className="flex items-center justify-center gap-1.5 sm:gap-4 flex-wrap max-w-full">
        <span className="text-2xl min-[360px]:text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white/90">
          PO
        </span>
        <span className="inline-flex items-center justify-center text-accent w-6 h-6 min-[360px]:w-8 min-[360px]:h-8 sm:w-16 sm:h-16 md:w-20 md:h-20 -my-1 sm:-my-2">
          <LogoMark className="w-full h-full animate-spin-slow" />
        </span>
        <span className="text-2xl min-[360px]:text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white/90">
          KETREELS
        </span>
        <span className="text-2xl min-[360px]:text-3xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-accent font-serif italic">
          360
        </span>
      </div>
    </div>
  );
}
