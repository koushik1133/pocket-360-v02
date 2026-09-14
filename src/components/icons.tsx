import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function iconProps({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r=".75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M9 7v10M15 7v10" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="m9 7 8 5-8 5V7Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4.1Z" />
      <path d="M8.2 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.8c.1.3.1.5-.1.7l-.6.8c-.2.2-.1.5 0 .7.5 1 1.3 1.8 2.3 2.3.2.1.5.2.7 0l.8-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .4-.2 1.3-.6 1.7-.5.5-1.3.8-2 .8-.8 0-2-.4-3.6-1.2-1.9-1-3.4-2.6-4.4-4.5-.7-1.3-.8-2.3-.7-3 .1-.6.4-1 .7-1.3Z" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...iconProps(props)}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
